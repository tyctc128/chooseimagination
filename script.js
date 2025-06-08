// 遊戲狀態
let currentImage = '';
let currentAnswer = '';
let guessCount = 0;
let isAnimating = false;

// 音效設定
const cheerSound = new Audio('music/cheer.mp3');
cheerSound.volume = 0.5; // 設定音量為50%

// 圖片路徑配置
const imagePaths = {
    'compose': {
        path: 'images/compose',
        answer: '加加減減法',
        files: ['1.png', '2.png', '3.png']
    },
    'multi': {
        path: 'images/multi',
        answer: '複合式',
        files: ['1.png', '2.png']
    },
    'peoplelike': {
        path: 'images/peoplelike',
        answer: '萬物有靈法',
        files: ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png']
    },
    'size': {
        path: 'images/size',
        answer: '改變大小法',
        files: ['1.png', '2.png']
    }
};

// 更新資料夾中的檔案列表
async function updateFileList() {
    // 檢查 size 資料夾中的檔案
    const sizeFiles = [];
    for (let i = 1; i <= 10; i++) {  // 檢查前10個可能的檔案
        try {
            const img = new Image();
            img.src = `images/size/${i}.png`;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            sizeFiles.push(`${i}.png`);
        } catch (error) {
            // 檔案不存在，繼續檢查下一個
            continue;
        }
    }
    imagePaths.size.files = sizeFiles;
    console.log('size 資料夾中的檔案：', sizeFiles);
}

// 獲取所有可能的圖片路徑
function getAllImagePaths() {
    const allPaths = [];
    Object.keys(imagePaths).forEach(folder => {
        imagePaths[folder].files.forEach(file => {
            allPaths.push({
                folder: folder,
                file: file,
                path: `${imagePaths[folder].path}/${file}`
            });
        });
    });
    return allPaths;
}

// 打亂數組順序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// DOM 元素
const startButton = document.getElementById('startButton');
const imageDisplay = document.getElementById('imageDisplay');
const currentImageElement = document.getElementById('currentImage');
const optionsDiv = document.getElementById('options');
const messageDiv = document.getElementById('message');
const fireworksDiv = document.getElementById('fireworks');

// 事件監聽器
startButton.addEventListener('click', startGame);
document.querySelectorAll('.option-button').forEach(button => {
    button.addEventListener('click', handleGuess);
});

// 開始遊戲
async function startGame() {
    if (isAnimating) return;
    
    isAnimating = true;
    guessCount = 0;
    messageDiv.textContent = '開始輪播...';
    startButton.style.display = 'none';
    currentImageElement.style.display = 'block';
    
    // 重置所有按鈕狀態
    document.querySelectorAll('.option-button').forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
    });
    
    // 獲取所有圖片路徑
    const allPaths = getAllImagePaths();
    console.log('載入的圖片總數：', allPaths.length);
    console.log('所有圖片路徑：', allPaths.map(p => p.path).join('\n'));
    
    try {
        // 第一輪：確保每張圖片都會出現
        console.log('開始第一輪輪播 - 確保每張圖片都出現');
        for (let i = 0; i < allPaths.length; i++) {
            currentImageElement.src = allPaths[i].path;
            console.log(`顯示圖片 ${i + 1}/${allPaths.length}: ${allPaths[i].path}`);
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        // 第二輪：隨機輪播
        console.log('開始第二輪隨機輪播');
        const shuffledPaths = [...allPaths];
        shuffleArray(shuffledPaths);
        
        for (let i = 0; i < 15; i++) {
            const randomIndex = i % shuffledPaths.length;
            currentImageElement.src = shuffledPaths[randomIndex].path;
            console.log(`隨機輪播 ${i + 1}/15: ${shuffledPaths[randomIndex].path}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        messageDiv.textContent = '';
        
        // 選擇最終答案和圖片
        const folders = Object.keys(imagePaths);
        const randomFolder = folders[Math.floor(Math.random() * folders.length)];
        currentAnswer = imagePaths[randomFolder].answer;
        
        const finalFiles = imagePaths[randomFolder].files;
        const finalFile = finalFiles[Math.floor(Math.random() * finalFiles.length)];
        const finalPath = `${imagePaths[randomFolder].path}/${finalFile}`;
        
        console.log('最終選擇的圖片：', finalPath);
        currentImageElement.src = finalPath;
        
        // 顯示選項
        optionsDiv.style.display = 'grid';
        isAnimating = false;
        
    } catch (error) {
        console.error('圖片載入或顯示過程中發生錯誤：', error);
        messageDiv.textContent = '有些圖片載入失敗，請重試';
        startButton.style.display = 'block';
        startButton.textContent = '重新開始';
        isAnimating = false;
    }
}

// 播放慶祝音效和顯示煙火
function celebrate() {
    showFireworks();
    // 播放音效
    cheerSound.currentTime = 0; // 重置音效到開始
    try {
        cheerSound.play().catch(error => {
            console.error('音效播放失敗：', error);
        });
    } catch (error) {
        console.error('音效播放失敗：', error);
    }
}

// 處理猜測
function handleGuess(event) {
    if (isAnimating) return;
    
    const guess = event.target.dataset.option;
    guessCount++;
    
    if (guess === currentAnswer) {
        celebrate(); // 使用新的慶祝函數
        messageDiv.textContent = '恭喜你答對了！';
        optionsDiv.style.display = 'none';
        startButton.style.display = 'block';
        startButton.textContent = '繼續下一題';
        
        // 禁用所有選項按鈕
        document.querySelectorAll('.option-button').forEach(button => {
            button.disabled = true;
        });
        
        // 3秒後自動開始下一題
        setTimeout(() => {
            if (startButton.style.display === 'block') {
                startGame();
            }
        }, 3000);
    } else if (guessCount === 1) {
        messageDiv.textContent = '答錯了，再試一次！';
        // 禁用已選擇的按鈕
        event.target.disabled = true;
        event.target.style.opacity = '0.5';
    } else {
        messageDiv.textContent = '還是錯誤，再加油喔!!!';
        optionsDiv.style.display = 'none';
        startButton.style.display = 'block';
        startButton.textContent = '繼續下一題';
        
        // 2秒後自動開始下一題
        setTimeout(() => {
            if (startButton.style.display === 'block') {
                startGame();
            }
        }, 2000);
    }
}

// 顯示煙火效果
function showFireworks() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            fireworksDiv.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }, i * 200);
    }
} 