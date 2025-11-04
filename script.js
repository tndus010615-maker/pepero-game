// ⭐️ 3단계에서 복사한 웹 앱 URL을 여기에 붙여넣으세요! ⭐️
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzCjnEYhzruWHSZPKVgqLujo5rPkIvUXsUMs7fGNGOAmvju6zexskAa0ITN4kKkcyHx/exec'; 

const peperoRainContainer = document.getElementById('pepero-rain-container');
const easterEgg = document.getElementById('easter-egg');
const chanceCounter = document.getElementById('chance-counter'); 
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');
const userNameInput = document.getElementById('user-name');
const resultsArea = document.getElementById('results-area');
const resultsList = document.getElementById('results-list');

let CHANCES_LEFT = 7;
const TOTAL_CHANCES = 7;
let GAME_OVER = false;
let WINNING_PEPERO_ID = null; 
let peperoCreationInterval; 
let peperoIndex = 0; 
let currentPlayerName = '';
let gamePlayed = false; 


// ====================== 기기 감지 및 기본 함수 ======================

function getDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // 모바일 기기 흔적 확인
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return '[모바일]';
    }
    // 일반적인 PC 환경
    return '[PC]';
}

function startGame() {
    currentPlayerName = userNameInput.value.trim();

    if (currentPlayerName.length < 2) {
        alert("이름을 두 글자 이상 입력해주세요!");
        return;
    }

    startScreen.classList.add('hidden');
    resultsArea.classList.add('hidden');
    gameArea.classList.remove('hidden');

    initializeGame();
}

function hideResults() {
    resultsArea.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function clearAllResults() {
    if (confirm("이 기기에 저장된 모든 로컬 기록을 정말로 삭제하시겠습니까? (통합 DB 기록에는 영향을 주지 않습니다)")) {
        localStorage.removeItem('peperoGameResults');
        alert("로컬 기록이 삭제되었습니다.");
        if (!resultsArea.classList.contains('hidden')) {
            hideResults();
        }
    }
}


// ====================== 게임 로직 함수 ======================

function initializeGame() {
    CHANCES_LEFT = TOTAL_CHANCES;
    GAME_OVER = false;
    peperoIndex = 0;
    
    // 당첨 빼빼로 ID 설정 (5번째 ~ 25번째 사이)
    WINNING_PEPERO_ID = Math.floor(Math.random() * (25 - 5 + 1)) + 5; 

    if (chanceCounter) {
        chanceCounter.textContent = `남은 기회: ${CHANCES_LEFT}번`;
    }

    peperoRainContainer.innerHTML = ''; 
    gamePlayed = false; 
    startPeperoRain();
}

function createPeperoStick() {
    const pepero = document.createElement('div');
    pepero.classList.add('pepero-stick');
    
    pepero.style.left = Math.random() * 100 + 'vw'; 
    const animationDuration = Math.random() * 5 + 5; 
    const animationDelay = Math.random() * 5; 
    pepero.style.animationDuration = animationDuration + 's';
    pepero.style.animationDelay = animationDelay + 's';
    
    peperoIndex++;
    
    if (peperoIndex === WINNING_PEPERO_ID) {
         pepero.dataset.winner = 'true';
    }

    pepero.addEventListener('click', handlePeperoClick);
    peperoRainContainer.appendChild(pepero);

    pepero.addEventListener('animationend', () => {
        pepero.remove();
    });
}

function handlePeperoClick(event) {
    if (GAME_OVER) return;

    const clickedStick = event.currentTarget;
    
    // 1. 당첨 여부 확인 (성공)
    if (clickedStick.dataset.winner === 'true') {
        GAME_OVER = true;
        clearInterval(peperoCreationInterval);
        
        if (!gamePlayed) saveGameResult(true); // 성공 기록 저장 (DB 전송)
        
        revealEasterEgg(true); 
        
        clickedStick.style.animation = 'none';
        clickedStick.style.transform = 'scale(1.2) translateY(-50px)';
        clickedStick.style.pointerEvents = 'none';
        clickedStick.style.zIndex = '300';
        
        document.querySelectorAll('.pepero-stick').forEach(stick => {
            stick.style.pointerEvents = 'none';
        });
        return;
    }

    // 2. 일반 클릭 (실패) 및 기회 차감
    CHANCES_LEFT--;
    
    if (chanceCounter) {
        chanceCounter.textContent = `남은 기회: ${CHANCES_LEFT}번`;
    }
    
    alert(`아쉽네요! 😥 당첨 빼빼로가 아닙니다. 남은 기회: ${CHANCES_LEFT}번`);
    
    clickedStick.remove();
    
    // 3. 기회 소진 (게임 오버 / 실패) 확인
    if (CHANCES_LEFT <= 0) {
        GAME_OVER = true;
        clearInterval(peperoCreationInterval);
        
        if (!gamePlayed) saveGameResult(false); // 실패 기록 저장 (DB 전송)
        
        revealEasterEgg(false);
        
        document.querySelectorAll('.pepero-stick').forEach(stick => {
            stick.style.animationPlayState = 'paused';
            stick.style.pointerEvents = 'none';
        });
        return;
    }
}


function revealEasterEgg(isWinner) {
    const h2 = easterEgg.querySelector('h2');
    const p = easterEgg.querySelector('p');
    const button = easterEgg.querySelector('button');

    if (isWinner) {
        h2.textContent = '✨ 빼빼로 당첨 ✨';
        p.textContent = `대박! 🎊 당신이 바로 오늘의 행운의 주인공! 🎉`;
        button.textContent = '게임 다시 시작';
    } else {
        h2.textContent = '😭 게임 오버! 😭';
        p.textContent = `아쉽게도 ${TOTAL_CHANCES}번의 기회 안에 당첨 빼빼로를 찾지 못했습니다. 다음에 다시 도전해보세요!`;
        button.textContent = '다시 도전';
    }
    
    easterEgg.classList.remove('hidden'); 
}

function hideEasterEgg() {
    easterEgg.classList.add('hidden');
    
    gameArea.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    userNameInput.value = currentPlayerName; 
}


function startPeperoRain() {
    const numberOfInitialSticks = 15;
    for (let i = 0; i < numberOfInitialSticks; i++) {
        setTimeout(createPeperoStick, i * 200); 
    }
    peperoCreationInterval = setInterval(createPeperoStick, 1000); 
}


// ====================== 결과 저장 및 표시 함수 (DB 연동) ======================

// 1. 결과 저장 함수 (DB로 전송)
async function saveGameResult(success) {
    const newResult = {
        name: currentPlayerName,
        success: success, // 불리언 값 (true/false)
        device: getDeviceType(),
        chances: TOTAL_CHANCES - CHANCES_LEFT // 남은 기회 (사용 X)
    };

    try {
        await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8' 
            },
            body: JSON.stringify(newResult),
        });
    } catch (error) {
        console.error('기록 저장 중 오류 발생:', error);
    }
    gamePlayed = true;
}


// 2. 결과 표시 함수 (DB에서 불러오기 및 그룹화)
async function showResults() {
    startScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    resultsList.innerHTML = '<p style="text-align: center; color: #777;">🌐 통합 기록을 불러오는 중...</p>';


    try {
        // GET 요청으로 DB에 저장된 모든 기록을 가져옵니다.
        const response = await fetch(GAS_WEBAPP_URL); 
        if (!response.ok) throw new Error('서버에서 데이터를 불러올 수 없습니다.');

        const allResults = await response.json(); 

        if (allResults.length === 0) {
            resultsList.innerHTML = '<p style="text-align: center; color: #777;">아직 플레이 기록이 없습니다.</p>';
            return;
        }

        // --- 이름별 그룹화 로직 ---

        const groupedResults = allResults.reduce((acc, result) => {
            if (!acc[result.name]) {
                acc[result.name] = [];
            }
            acc[result.name].push(result);
            return acc;
        }, {});

        resultsList.innerHTML = ''; 
        
        // 이름 목록을 최근 플레이한 순서대로 정렬 (가장 최근 기록이 가장 마지막에 있기 때문에 역순으로 정렬)
        const uniqueNamesInOrder = [...new Set(allResults.map(r => r.name))].reverse();

        uniqueNamesInOrder.forEach(name => {
            const results = groupedResults[name].reverse(); // 최신 기록이 위로 오도록 정렬

            const nameHeader = document.createElement('div');
            nameHeader.classList.add('name-header');
            nameHeader.innerHTML = `<strong>${name}</strong> <span style="font-size: 0.7em; color: #666;">(총 ${results.length}회 시도)</span>`;
            resultsList.appendChild(nameHeader);

            results.forEach((result, index) => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                
                const statusClass = result.success ? 'success' : 'failure';
                const statusText = result.success ? '성공' : '실패';
                
                // GAS에서 저장된 시간 문자열을 파싱하여 표시
                const displayTime = new Date(result.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
                
                // 요청하신 형식: [기기] 성공/실패 시간
                const historyText = `${result.device} 시도 ${results.length - index}회`;

                historyItem.innerHTML = `
                    <span>${historyText}</span>
                    <span>
                        <span class="${statusClass}">${statusText}</span>
                        <span style="color: #999; margin-left: 10px;">${displayTime}</span>
                    </span>
                `;
                resultsList.appendChild(historyItem);
            });
        });

    } catch (error) {
        resultsList.innerHTML = `<p style="text-align: center; color: #F44336;">기록을 불러오지 못했습니다. (연결 오류를 확인하세요)</p>`;
    }
}


// 페이지 로드 시 시작 화면만 표시
gameArea.classList.add('hidden'); 
resultsArea.classList.add('hidden'); 
startScreen.classList.remove('hidden');