const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const spinsLeftDisplay = document.getElementById("spinsLeft");
const scoreDisplay = document.getElementById("score");

function hasCoinsManager() {
    return typeof CoinsManager !== "undefined";
}

function awardCoins(amount) {
    if (amount <= 0) return;
    if (hasCoinsManager() && typeof CoinsManager.addCoins === "function") {
        CoinsManager.addCoins(amount);
    }
}

function formatNumber(value) {
    try {
        return Number(value).toLocaleString("de-DE");
    } catch (err) {
        return String(value);
    }
}

function updateScoreDisplay() {
    scoreDisplay.innerText = formatNumber(totalScore) + " Coins";
}

function resizeCanvas(){
    canvas.width = 320;
    canvas.height = 320;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const prizes = ["100 Coins", "1000 Coins", "Niete", "10 Coins", "Thank You", "Niete"];
const colors = ["#7C4DFF", "#5E31E6", "#7C4DFF", "#5E31E6", "#7C4DFF", "#5E31E6"];

let startAngle = 0;
let spinVelocity = 0;
let spinning = false;
const arc = (2 * Math.PI) / prizes.length;

let spinsLeft = 10;
let totalScore = 0;
let bonusSliceIndex = -1;

function drawWheel(){
    const size = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < prizes.length; i++){
        const angle = startAngle + i * arc;

        // Highlight bonus slice if applicable
        if(i === bonusSliceIndex){
            ctx.shadowColor = 'gold';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffd700'
            
    }else{
        ctx.shadowBlur = 0;
        ctx.fillStyle = colors[i];
    }
    ctx.beginPath();
    ctx.moveTo(size, size)
    ctx.arc(size, size, size, angle, angle + arc);
    ctx.lineTo(size, size);
    ctx.fill();

    //Reset Shadow for Text
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.fillStyle = i === bonusSliceIndex ? '#333': '#fff';
    ctx.font = "bold 18px Arial";
    ctx.translate(
        size + Math.cos(angle + arc / 2) * (size - 50),
        size + Math.sin(angle + arc / 2) * (size - 50)
    );
    ctx.rotate(angle + arc / 2);
    ctx.fillText(prizes[i], -ctx.measureText(prizes[i]).width / 2, 0);
    ctx.restore();
}
}

function animateWheel() {
    if(!spinning) return;

    startAngle += spinVelocity;
    spinVelocity *= 0.98;

    if(spinVelocity < 0.002){
        spinning = false;
        finalizeResult();
        return;
    }
    drawWheel();
    requestAnimationFrame(animateWheel);
}
function finalizeResult(){
    const degrees = (startAngle * 180 / Math.PI + 90) % 360;
    const index = Math.floor((360 - degrees) / (360 / prizes.length)) % prizes.length;
    const prize = prizes[index];

    //Reset Bonus Slice highlight
    bonusSliceIndex = -1;

    if(prize === "Thank You"){
        result.classList.remove("bonus-glow");
        spinBtn.classList.remove("bonus-button-glow");
        result.innerText = "\u{1F64F} Thank You, Try Again!"
    }else{
        result.innerText = `\u{1F389} Du gewinnst ${prize}!`;

        const coinMatch = prize.match(/(\d+) Coins/);
        if (coinMatch) {
            const wonAmount = parseInt(coinMatch[1], 10);
            totalScore += wonAmount;
            awardCoins(wonAmount);
            updateScoreDisplay();

            if (wonAmount === 1000) {
                //Add Big Bonus design effects
                result.classList.add("bonus-glow");
                spinBtn.classList.add("bonus-button-glow");
                bonusSliceIndex = index;
            } else {
                result.classList.remove("bonus-glow");
                spinBtn.classList.remove("bonus-button-glow");
            }
        } else {
            result.classList.remove("bonus-glow");
            spinBtn.classList.remove("bonus-button-glow");
        }
    }
}
    result.style.opacity = 1;
    result.style.transform = "scale(1.1)";
    setTimeout(() => {
        result.style.transform = "scale(1)";
    }, 300);

    spinsLeft--;
    spinsLeftDisplay.innerText = spinsLeft;

    if(spinsLeft <= 0){
        spinBtn.disabled = true;
        spinBtn.innerText = "No Spins left";

    }
    drawWheel();
}
spinBtn.addEventListener("click", () =>{
    if(spinning || spinsLeft <= 0) return;
    result.style.opacity = 0;
    spinVelocity = Math.random() * 0.3 + 0.25;
    spinning = true;
    animateWheel();
})
updateScoreDisplay();
drawWheel();
