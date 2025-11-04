// [script.js] - 클라이언트 코드 (Apps Script 연동)

// ⭐️ 중요: 여기에 배포하신 Apps Script 웹 앱 URL을 반드시 입력하세요! ⭐️
// (배포 후 매번 새로운 버전으로 업데이트해야 합니다.)
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwg2KUcOsdj5a6rzDtuxE-FUvRwexzHLYQqRyj8gxd_g8CCTMU97vcc13e2WCPf90jC/exec'; 

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
    if (confirm("🚨 모든 기기에서 공유되는 **서버 기록**과 이 기기에 저장된 **로컬 기록**을 모두 삭제하시겠습니까?")) {
        // 1. 서버 기록 삭제 시도
        clearAllRemoteResults();
        
        // 2. 로컬 기록 삭제
        localStorage.removeItem('peperoGameResults');
        alert("로컬 및 서버 기록 삭제 요청 완료.");
        
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
        
        if (!gamePlayed) saveGameResult(true); // 성공 기록 서버 저장
        
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
        
        if (!gamePlayed) saveGameResult(false); // 실패 기록 서버 저장
        
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


// ====================== 결과 저장 및 표시 함수 (Apps Script 연동) ======================

// 1. 결과 저장 함수 (서버에 저장하고, 실패 시 로컬에 백업)
function saveGameResult(success) {
    const newResult = {
        name: currentPlayerName,
        success: success,
        device: getDeviceType(),
        chances: TOTAL_CHANCES - CHANCES_LEFT,
        timestamp: new Date().toLocaleString() // 로컬 백업용 시간 기록 (서버는 서버 시간 사용)
    };
    
    // ⭐️ 원격 저장 시도 (다른 PC와 공유) ⭐️
    saveRemoteResult(newResult); 
    
    gamePlayed = true;
}

// 2. 로컬 저장소 백업 함수 (서버 저장 실패 시 호출)
function saveGameResultLocally(result) {
    try {
        const storedResults = JSON.parse(localStorage.getItem('peperoGameResults')) || [];
        storedResults.push(result);
        localStorage.setItem('peperoGameResults', JSON.stringify(storedResults));
        console.log('✅ 기록 저장 성공 (로컬 저장소 백업):', result);
    } catch (error) {
        console.error('❌ 로컬 기록 저장 중 오류 발생:', error);
    }
}

/**
 * Apps Script 웹 앱으로 GET 요청을 보내 데이터를 조회합니다.
 * ⭐️ URLSearchParams를 사용하여 action=get 파라미터를 안정적으로 추가합니다.
 */
async function getRemoteResults() {
    // 1. URL 객체 생성 및 파라미터 추가
    const url = new URL(GAS_WEBAPP_URL);
    url.searchParams.append('action', 'get'); // 'action=get' 파라미터 추가
    
    try {
        // 2. 수정된 URL로 fetch 요청
        const response = await fetch(url.toString()); 
        
        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        
        // Apps Script에서 JAVASCRIPT(JSONP) 형식으로 응답을 보냄
        const responseText = await response.text();
        return JSON.parse(responseText); 

    } catch (error) {
        console.error('❌ 원격 기록 조회 중 오류 발생 (파라미터 확인 필요):', error);
        return []; 
    }
}

/**
 * Apps Script 웹 앱으로 POST 요청을 보내 데이터를 저장합니다.
 */
async function saveRemoteResult(resultData) {
    const urlParams = new URLSearchParams();
    urlParams.append('action', 'save');
    urlParams.append('name', resultData.name);
    urlParams.append('success', resultData.success ? 'TRUE' : 'FALSE'); 
    urlParams.append('device', resultData.device);
    urlParams.append('chances', resultData.chances);

    try {
        const response = await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            body: urlParams,
        });

        if (!response.ok) {
            console.error('❌ 원격 기록 저장 실패 (Apps Script 오류). 로컬에 저장합니다.');
            throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        console.log('✅ 기록 저장 성공 (Apps Script):', resultData);
    } catch (error) {
        console.error('❌ 원격 기록 저장 중 오류 발생. 로컬에 저장합니다.', error);
        saveGameResultLocally(resultData);
    }
}

/**
 * 모든 원격 기록 데이터를 삭제합니다. 
 */
async function clearAllRemoteResults() {
    const urlParams = new URLSearchParams();
    urlParams.append('action', 'clear');

    try {
        const response = await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            body: urlParams,
        });

        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        console.log("✅ 서버 기록 삭제 완료.");
    } catch (error) {
        console.error('❌ 원격 기록 삭제 중 오류 발생:', error);
        alert("서버 기록 삭제 실패!");
    }
}


// 3. 결과 표시 함수 (서버에서 불러오기)
async function showResults() { 
    startScreen.classList.add('hidden');
    gameArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    resultsList.innerHTML = '<p style="text-align: center; color: #777;">⏳ **서버 기록**을 불러오는 중...</p>';

    // ⭐️ 서버에서 모든 기록을 불러옵니다. ⭐️
    let allResults = await getRemoteResults(); 
    
    if (allResults.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; color: #777;">아직 서버에 플레이 기록이 없습니다.</p>';
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
    
    // 이름 목록을 최근 플레이한 순서대로 정렬 (Apps Script에서 역순 정렬되어 왔음)
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
            
            const statusClass = result.success ? 'success' : 'failure';
            const statusText = result.success ? '성공' : '실패';
            
            // Apps Script에서 온 timestamp (예: "2025. 11. 4. 오전 11:36:28")
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