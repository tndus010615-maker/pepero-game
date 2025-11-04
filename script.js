// [script.js] - 클라이언트 코드 (로컬 저장소 전용)

// ⭐️ Apps Script URL 제거 (더 이상 서버 통신을 사용하지 않음) ⭐️
// const GAS_WEBAPP_URL = '...'; 

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
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return '[모바일]';
    }
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
    if (confirm("🚨 이 기기에 저장된 **모든 로컬 기록**을 삭제하시겠습니까? (서버 기록은 사용하지 않습니다.)")) {
        // 로컬 기록 삭제만 시도
        localStorage.removeItem('peperoGameResults');
        alert("로컬 기록 삭제 완료. 서버 기록은 사용하지 않습니다.");
        
        if (!resultsArea.classList.contains('hidden')) {
            hideResults();
        }
    }
}


// ====================== 게임 로직 함수 (기존과 동일) ======================

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
        
        if (!gamePlayed) saveGameResult(true); // 성공 기록 로컬 저장으로 변경
        
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
        
        if (!gamePlayed) saveGameResult(false); // 실패 기록 로컬 저장으로 변경
        
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


// ====================== 결과 저장 및 표시 함수 (로컬 저장소 전용) ======================

// 1. 결과 저장 함수 (로컬 저장소에 직접 저장)
function saveGameResult(success) {
    const newResult = {
        name: currentPlayerName,
        success: success, // 불리언 값 그대로 저장
        device: getDeviceType(),
        chances: TOTAL_CHANCES - CHANCES_LEFT,
        timestamp: new Date().toLocaleString('ko-KR') // 로컬 시간 기록
    };
    
    // ⭐️ 로컬 저장소에 저장만 시도합니다. ⭐️
    saveGameResultLocally(newResult); 
    
    gamePlayed = true;
}

// 2. 로컬 저장소에 저장하는 실제 로직 (이 함수가 이제 메인 저장 함수가 됨)
function saveGameResultLocally(result) {
    try {
        // 데이터 불러오기 (없으면 빈 배열)
        const storedResults = JSON.parse(localStorage.getItem('peperoGameResults')) || [];
        
        // 새로운 결과를 배열 맨 앞에 추가 (최신순)
        storedResults.unshift(result); 
        
        // 로컬 저장소에 다시 저장
        localStorage.setItem('peperoGameResults', JSON.stringify(storedResults));
        console.log('✅ 기록 저장 성공 (로컬 저장소):', result);
    } catch (error) {
        console.error('❌ 로컬 기록 저장 중 오류 발생:', error);
    }
}

// 3. 원격 기록 조회 함수 제거 및 로컬 조회로 대체
async function getRemoteResults() {
    // ⭐️ 서버 통신을 하지 않고 로컬 데이터만 반환합니다. ⭐️
    try {
        const storedResults = JSON.parse(localStorage.getItem('peperoGameResults')) || [];
        // 저장할 때 unshift 했으므로 이미 최신순입니다.
        return storedResults; 
    } catch (error) {
        console.error('❌ 로컬 기록 조회 중 오류 발생:', error);
        return []; 
    }
}

// 4. 원격 저장 함수 제거 (로컬 저장소로 대체)
// async function saveRemoteResult(resultData) { /* 제거 */ }

// 5. 원격 기록 삭제 함수 제거 (로컬 기록 삭제로 대체됨)
// async function clearAllRemoteResults() { /* 제거 */ }


// 6. 결과 표시 함수 (로컬에서 불러오기)
async function showResults() { 
    startScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    resultsList.innerHTML = '<p style="text-align: center; color: #777;">⏳ **로컬 기록**을 불러오는 중...</p>';

    // ⭐️ 로컬 저장소에서 모든 기록을 불러옵니다. ⭐️
    let allResults = await getRemoteResults(); 
    
    if (allResults.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; color: #777;">아직 이 기기에 플레이 기록이 없습니다.</p>';
        return;
    }

    // --- 이름별 그룹화 로직 (로컬 데이터에 맞게 수정) ---

    const groupedResults = allResults.reduce((acc, result) => {
        if (!acc[result.name]) {
            acc[result.name] = [];
        }
        acc[result.name].push(result);
        return acc;
    }, {});

    resultsList.innerHTML = ''; 
    
    // 이름 목록을 로컬에 저장된 순서대로 정렬 (최신 플레이 순서)
    const uniqueNamesInOrder = [...new Set(allResults.map(r => r.name))]; 

    uniqueNamesInOrder.forEach(name => {
        const results = groupedResults[name];

        const nameHeader = document.createElement('div');
        nameHeader.classList.add('name-header');
        nameHeader.innerHTML = `<strong>${name}</strong> <span style="font-size: 0.7em; color: #666;">(총 ${results.length}회 시도)</span>`;
        resultsList.appendChild(nameHeader);

        results.forEach((result, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            
            const statusClass = result.success ? 'success' : 'failure'; // 불리언 값 그대로 사용
            const statusText = result.success ? '성공' : '실패';
            
            // 로컬 저장소에서 온 timestamp (예: "2025. 11. 4. 오전 12:00:00")
            const fullTimestamp = result.timestamp;
            
            const historyText = `${result.device} 시도 ${results.length - index}회`;

            historyItem.innerHTML = `
                <span>${historyText}</span>
                <span>
                    <span class="${statusClass}">${statusText}</span>
                    <span style="color: #999; margin-left: 10px;">${fullTimestamp}</span>
                </span>
            `;
            resultsList.appendChild(historyItem);
        });
    });
}


// 페이지 로드 시 시작 화면만 표시
gameArea.classList.add('hidden'); 
resultsArea.classList.add('hidden'); 
startScreen.classList.remove('hidden');