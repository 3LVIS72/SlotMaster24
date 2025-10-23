document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("wheel");
    const spinBtn = document.getElementById("spinBtn");
    const result = document.getElementById("result");
    const scoreDisplay = document.getElementById("score");

    if (!canvas || !spinBtn || !result || !scoreDisplay) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PRIZES = ["100 Coins", "1000 Coins", "Niete", "10 Coins", "Thank You", "Niete"];
    const COLORS = ["#7C4DFF", "#5E31E6", "#7C4DFF", "#5E31E6", "#7C4DFF", "#5E31E6"];
    const SLICE_ARC = (2 * Math.PI) / PRIZES.length;

    const state = {
        startAngle: 0,
        spinVelocity: 0,
        spinning: false,
        bonusSliceIndex: -1,
        totalScore: 0,
    };

    function hasCoinsManager() {
        return typeof CoinsManager !== "undefined";
    }

    function awardCoins(amount) {
        if (amount <= 0) return;
        if (hasCoinsManager() && typeof CoinsManager.addCoins === "function") {
            CoinsManager.addCoins(amount);
        }
    }

    function hasEnoughCoins(amount) {
        if (hasCoinsManager() && typeof CoinsManager.hasEnoughCoins === "function") {
            return CoinsManager.hasEnoughCoins(amount);
        }
        return true;
    }

    function removeCoins(amount) {
        if (hasCoinsManager() && typeof CoinsManager.removeCoins === "function") {
            return CoinsManager.removeCoins(amount);
        }
        return true;
    }

    function formatNumber(value) {
        try {
            return Number(value).toLocaleString("de-DE");
        } catch (err) {
            return String(value);
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.innerText = `${formatNumber(state.totalScore)} Coins`;
    }

    function syncCanvasSize() {
        const logicalSize = Math.min(320, Math.floor(canvas.clientWidth || 320));
        canvas.width = logicalSize;
        canvas.height = logicalSize;
    }

    function drawWheel() {
        const size = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < PRIZES.length; i++) {
            const angle = state.startAngle + i * SLICE_ARC;

            if (i === state.bonusSliceIndex) {
                ctx.shadowColor = "gold";
                ctx.shadowBlur = 22;
                ctx.fillStyle = "#ffd700";
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = COLORS[i % COLORS.length];
            }

            ctx.beginPath();
            ctx.moveTo(size, size);
            ctx.arc(size, size, size, angle, angle + SLICE_ARC);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.save();
            ctx.fillStyle = i === state.bonusSliceIndex ? "#333" : "#fff";
            ctx.font = "bold 18px Poppins, Arial, sans-serif";
            ctx.translate(
                size + Math.cos(angle + SLICE_ARC / 2) * (size - 52),
                size + Math.sin(angle + SLICE_ARC / 2) * (size - 52)
            );
            ctx.rotate(angle + SLICE_ARC / 2);
            const text = PRIZES[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 6);
            ctx.restore();
        }
    }

    function animateWheel() {
        if (!state.spinning) return;

        state.startAngle += state.spinVelocity;
        state.spinVelocity *= 0.982;

        if (state.spinVelocity < 0.0025) {
            state.spinning = false;
            finalizeResult();
            return;
        }

        drawWheel();
        requestAnimationFrame(animateWheel);
    }

    function finalizeResult() {
        const degrees = ((state.startAngle * 180) / Math.PI + 90) % 360;
        const sliceIndex = Math.floor((360 - degrees) / (360 / PRIZES.length)) % PRIZES.length;
        const prize = PRIZES[sliceIndex];

        state.bonusSliceIndex = -1;

        if (prize === "Thank You") {
            result.classList.remove("bonus-glow");
            spinBtn.classList.remove("bonus-button-glow");
            result.innerText = "\u{1F64F} Danke, versuche es erneut!";
        } else {
            result.innerText = `\u{1F389} Du gewinnst ${prize}!`;

            const coinMatch = prize.match(/(\d+)\s*Coins/);
            if (coinMatch) {
                const wonAmount = parseInt(coinMatch[1], 10);
                state.totalScore += wonAmount;
                awardCoins(wonAmount);
                updateScoreDisplay();

                if (wonAmount >= 1000) {
                    result.classList.add("bonus-glow");
                    spinBtn.classList.add("bonus-button-glow");
                    state.bonusSliceIndex = sliceIndex;
                } else {
                    result.classList.remove("bonus-glow");
                    spinBtn.classList.remove("bonus-button-glow");
                }
            } else {
                result.classList.remove("bonus-glow");
                spinBtn.classList.remove("bonus-button-glow");
            }
        }

        result.style.opacity = 1;
        result.style.transform = "scale(1.08)";
        setTimeout(() => {
            result.style.transform = "scale(1)";
        }, 320);

        drawWheel();
    }

    spinBtn.addEventListener("click", () => {
        if (state.spinning) return;

        if (!hasEnoughCoins(5) || !removeCoins(5)) {
            result.classList.remove("bonus-glow");
            spinBtn.classList.remove("bonus-button-glow");
            result.style.opacity = 1;
            result.innerText = "Nicht genug Coins (5 benötigt).";
            return;
        }

        state.totalScore -= 5;
        updateScoreDisplay();

        result.classList.remove("bonus-glow");
        spinBtn.classList.remove("bonus-button-glow");
        result.style.opacity = 0;
        state.spinVelocity = Math.random() * 0.32 + 0.27;
        state.spinning = true;
        state.bonusSliceIndex = -1;
        animateWheel();
    });

    window.addEventListener("resize", () => {
        syncCanvasSize();
        drawWheel();
    });

    result.textContent = "Bereit zum Drehen? Tippe auf den Button und schnapp dir einen Gewinn.";
    updateScoreDisplay();
    syncCanvasSize();
    drawWheel();
});
