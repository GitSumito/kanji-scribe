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
    document.getElementById('kanjiInput').focus();
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
        alert("1文字の漢字を入力してください");
        return;
    }

    // Unicode を取得してゼロ埋め (5桁の 16進数)
    const codePoint = kanji.codePointAt(0).toString(16).padStart(5, '0');
    const svgPath = `bin/${codePoint}.svg`;

    fetch(svgPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`SVG not found: ${svgPath}`);
            }
            return response.text();
        })
        .then(svgText => {
            // 余計な "]>" を削除する処理を追加
            const cleanSvgText = svgText.replace(/]\>/g, "");
            const container = document.getElementById('kanjiContainer');
            container.innerHTML = cleanSvgText;

            // SVG要素を取得
            const svgElement = container.querySelector('svg');
            // SVG.js v3の正しい初期化方法
            const draw = SVG(svgElement);
            
            // 書き順番号のテキスト要素を取得して一時的に非表示にする
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach(text => {
                text.style.display = 'none';
            });
            
            // すべてのパスを取得
            const paths = svgElement.querySelectorAll('path');
            
            // パスを書き順でソート
            const sortedPaths = Array.from(paths).sort((a, b) => {
                const idA = a.getAttribute('kvg:element-id') || '';
                const idB = b.getAttribute('kvg:element-id') || '';
                const indexA = parseInt(idA.split('_').pop()) || 0;
                const indexB = parseInt(idB.split('_').pop()) || 0;
                return indexA - indexB;
            });

            // 最初はすべてのパスを非表示にする
            sortedPaths.forEach(path => {
                path.style.visibility = 'hidden';
            });

            // 各パスを順番にアニメーションで表示する関数
            async function animateStrokes() {
                for (let i = 0; i < sortedPaths.length; i++) {
                    const path = sortedPaths[i];
                    // パスを表示に設定
                    path.style.visibility = 'visible';
                    
                    // SVG.jsでパスを操作するためのオブジェクトを取得
                    const svgPath = SVG(path);
                    
                    // パスのスタイル設定
                    svgPath.fill('none').stroke({ width: 3, color: '#4a90e2' });
                    
                    // パスの長さを取得
                    const length = path.getTotalLength();
                    
                    // ストロークダッシュの設定
                    path.style.strokeDasharray = length;
                    path.style.strokeDashoffset = length;
                    
                    // スピードスライダーの値を使用してアニメーション速度を調整
                    const duration = 1500 / speedSlider.value;
                    
                    // アニメーション
                    await new Promise(resolve => {
                        // CSSトランジションを使用してアニメーション
                        path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;
                        setTimeout(() => {
                            path.style.strokeDashoffset = '0';
                        }, 50); // 少し遅延させて確実にトランジションが適用されるようにする
                        
                        // アニメーション完了を待つ
                        setTimeout(resolve, duration + 100);
                    });
                }
                
                // アニメーション終了後、書き順番号を表示する
                setTimeout(() => {
                    // テキスト要素（書き順番号）を表示
                    textElements.forEach(text => {
                        text.style.display = 'block';
                    });
                    
                    // 漢字の輪郭を強調（完成状態）
                    sortedPaths.forEach(path => {
                        // 完成状態でのスタイルを設定
                        path.style.transition = 'all 0.5s ease-in-out';
                        path.style.stroke = '#2c3e50'; // 濃い色に変更
                        path.style.strokeWidth = '2';  // 線の太さを調整
                        path.style.strokeDasharray = 'none'; // ダッシュをリセット
                        path.style.strokeDashoffset = '0';
                    });
                }, 500); // アニメーション終了から少し遅延して表示
            }

            // アニメーション開始
            animateStrokes();
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            alert('漢字のSVGファイルが見つかりませんでした。');
        });
});