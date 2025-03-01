// エンターキーのイベントリスナーを追加
document.getElementById('kanjiInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('showButton').click();
    }
});

// クリアボタンの機能を追加
document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('kanjiInput').value = '';
    document.getElementById('kanjiContainer').innerHTML = '';
    document.getElementById('kanjiInfoContainer').style.display = 'none';
    document.getElementById('kanjiInput').focus();
    isPaused = false;
    document.getElementById('pauseButton').textContent = '一時停止';
    const kanjiInfoContainer = document.getElementById('kanjiInfoContainer');
    if (kanjiInfoContainer) {
        kanjiInfoContainer.style.display = 'none';
    }
});

// スピードスライダーの処理を追加
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

speedSlider.addEventListener('input', function() {
    const speed = this.value;
    // スピード表示を更新
    if (speed < 1.5) {
        speedValue.textContent = 'ゆっくり';
    } else if (speed > 1.5) {
        speedValue.textContent = '速い';
    } else {
        speedValue.textContent = '標準';
    }
});

document.getElementById('showButton').addEventListener('click', function() {
    const kanji = document.getElementById('kanjiInput').value.trim();
    if (kanji.length !== 1) {
        return;  // エラーメッセージを表示しない
    }
    
    // 漢字情報を取得
    fetchKanjiInfo(kanji);
    
    // Unicode を取得してゼロ埋め (5桁の 16進数)
    const codePoint = kanji.codePointAt(0).toString(16).padStart(5, '0');
    const svgPath = `bin/${codePoint}.svg?v=${new Date().getTime()}`;
    
    fetch(svgPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`SVG not found: ${svgPath}`);
            }
            return response.text();
        })
        .then(svgText => {
            const cleanSvgText = svgText.replace(/]\>/g, "");
            const container = document.getElementById('kanjiContainer');
            container.innerHTML = cleanSvgText;
            
            // SVG要素と初期設定
            const svgElement = container.querySelector('svg');
            const draw = SVG(svgElement);
            
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach(text => {
                text.style.display = 'none';
            });
            
            const paths = svgElement.querySelectorAll('path');
            const sortedPaths = Array.from(paths).sort((a, b) => {
                const idA = a.getAttribute('kvg:element-id') || '';
                const idB = b.getAttribute('kvg:element-id') || '';
                const indexA = parseInt(idA.split('_').pop()) || 0;
                const indexB = parseInt(idB.split('_').pop()) || 0;
                return indexA - indexB;
            });
            sortedPaths.forEach(path => {
                path.style.visibility = 'hidden';
            });
            
            async function animateStrokes() {
                for (let i = 0; i < sortedPaths.length; i++) {
                    const path = sortedPaths[i];
                    
                    // 一時停止中の場合、Promise を作成して待機
                    while (isPaused) {
                        await new Promise(resolve => {
                            currentAnimation = resolve;
                        });
                    }

                    path.style.visibility = 'visible';
                    const svgPathObject = SVG(path);
                    svgPathObject.fill('none').stroke({ width: 3, color: '#4a90e2' });
                    const length = path.getTotalLength();
                    path.style.strokeDasharray = length;
                    path.style.strokeDashoffset = length;
                    const duration = 1500 / speedSlider.value;
                    await new Promise(resolve => {
                        path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;
                        setTimeout(() => { path.style.strokeDashoffset = '0'; }, 50);
                        setTimeout(resolve, duration + 100);
                    });
                }
                setTimeout(() => {
                    textElements.forEach(text => {
                        text.style.display = 'block';
                    });
                    sortedPaths.forEach(path => {
                        path.style.transition = 'all 0.5s ease-in-out';
                        path.style.stroke = '#2c3e50';
                        path.style.strokeWidth = '2';
                        path.style.strokeDasharray = 'none';
                        path.style.strokeDashoffset = '0';
                    });
                }, 500);
            }
            
            animateStrokes();
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            // エラーメッセージを表示しない
        });
});

// 漢字情報を取得・表示する関数
function fetchKanjiInfo(kanji) {
    const apiUrl = `https://sumito.jp/app/japanese-dictionary/search.php?kanji=${encodeURIComponent(kanji)}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const kanjiInfoContainer = document.getElementById('kanjiInfoContainer');
            const kanjiInfoElement = document.getElementById('kanjiInfo');
            
            // データが空または必要な情報が含まれていない場合は非表示
            if (!data || (!data.radical && !data.on_reading && !data.kun_reading && !data.meaning)) {
                kanjiInfoContainer.style.display = 'none';
                return;
            }
            
            // 内容をクリア
            kanjiInfoElement.innerHTML = '';
            
            // 各情報を追加
            if (data.radical) {
                appendInfoItem(kanjiInfoElement, '部首', data.radical);
            }
            if (data.on_reading) {
                appendInfoItem(kanjiInfoElement, '音読み', data.on_reading);
            }
            if (data.kun_reading) {
                appendInfoItem(kanjiInfoElement, '訓読み', data.kun_reading);
            }
            if (data.meaning) {
                appendInfoItem(kanjiInfoElement, '意味', data.meaning);
            }
            
            // 表示を強制
            kanjiInfoContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching kanji info:', error);
            document.getElementById('kanjiInfoContainer').style.display = 'none';
        });
}

// 情報項目を追加する関数
function appendInfoItem(parent, title, content) {
    if (!content) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'kanji-info-item';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'kanji-info-title';
    titleElement.textContent = title;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'kanji-info-content';
    contentElement.textContent = content;
    
    wrapper.appendChild(titleElement);
    wrapper.appendChild(contentElement);
    parent.appendChild(wrapper);
}

document.addEventListener("DOMContentLoaded", function(){
    // 再表示ボタンのクリックイベントを設定
    document.getElementById("refreshButton").addEventListener("click", function(){
        // 表示ボタンのクリックをシミュレートすることで、同じ処理を実行
        document.getElementById("showButton").click();
    });
});

function shareLine() {
    const text = "漢字の書き順アニメーションで勉強しよう！";
    const url = encodeURIComponent(window.location.href);
    window.open(`https://line.me/R/msg/text/?${text}%0D%0A${url}`);
}

function shareTwitter() {
    const text = "漢字の書き順アニメーションで勉強しよう！";
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
}

let isPaused = false;
let currentAnimation = null;

document.getElementById('pauseButton').addEventListener('click', function() {
    isPaused = !isPaused;
    const paths = document.querySelectorAll('#kanjiContainer path');
    
    if (isPaused) {
        this.textContent = '再開';
        // アニメーション中のすべてのパスを一時停止
        paths.forEach(path => {
            const computedStyle = window.getComputedStyle(path);
            path.style.transition = 'none';
            path.style.strokeDashoffset = computedStyle.strokeDashoffset;
        });
    } else {
        this.textContent = '一時停止';
        // アニメーションを再開
        paths.forEach(path => {
            path.style.transition = `stroke-dashoffset ${1500 / speedSlider.value}ms ease-in-out`;
            path.style.strokeDashoffset = '0';
        });
        // 一時停止中のアニメーションを再開
        if (currentAnimation) {
            const resumeAnimation = currentAnimation;
            currentAnimation = null;
            resumeAnimation();
        }
    }
});