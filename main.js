const BARS_ANIMATION_DELAY = 100; // milliseconds

window.Utils = class {
    static randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    static randomIntArray(length, min, max) {
        return Array.from({ length: length }, () => window.Utils.randomInt(min, max));
    }

    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static debounce = (fn, delay) => {
        let timeoutId;

        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fn(...args);
            }, delay);
        };
    };

    static normalize = (value, min, max) => {
        return ((value - min) / (max - min)) * 100;
    };
};

class Tabs extends HTMLElement {
    structure = JSON.parse(this.querySelector('script[type="application/json"]')?.textContent ?? null);

    constructor() {
        super();
        this.renderStructure();
        this.querySelector(".tabs-header").addEventListener("click", this.onTabClick.bind(this));
    }

    onTabClick(evt) {
        if (!evt.target.matches(".tab-item")) return;

        const index = evt.target.dataset.tabItem;
        const tab = this.querySelector(`.tab-content[data-tab-content="${index}"]`);

        // Resetting active tab
        evt.currentTarget.querySelector(".tab-item.active").classList.remove("active");
        evt.target.classList.add("active");

        this.querySelector(".tab-content.active").classList.remove("active");
        tab.classList.add("active");

        tab.querySelector("sorting-algorithm").dispatchEvent(new Event("tab-change"));
    }

    renderStructure() {
        const HTML = `
            <div class="tabs-header">
                ${this.structure.reduce(
                    (html, item, i) => `
                    ${html}
                    <div class="tab-item${item.active ? " active" : ""}" data-tab-item="${i}">${item.title}</div>
                `,
                    ""
                )}
            </div>

            <div class="tabs-content">
                ${this.structure.reduce(
                    (html, item, i) => `
                    ${html}
                    <div class="tab-content${item.active ? " active" : ""}" data-tab-content="${i}">${item.content}</div>
                `,
                    ""
                )}
            </div>
        `;

        this.innerHTML = HTML;
    }
}

class Algorithm extends HTMLElement {
    minBars = 5;
    maxBars = 50;

    minInt = 5;
    maxInt = 1000;

    pause = true;

    barsCount = this.setBarsCount(parseInt(this.dataset.barsCount) || this.maxBars);
    randomInts = window.Utils.randomIntArray(this.barsCount, this.minInt, this.maxInt);

    algorithm = window.algorithms[this.dataset.algorithm] || window.algorithms.BubbleSort;

    controlEls = {};

    constructor() {
        super();

        // Display error message if algorithm is not found
        if (!window.algorithms[this.dataset.algorithm]) {
            console.error(`Algorithm ${this.dataset.algorithm} not found. BubbleSort will be used as default.`);
            console.log("Available algorithms", window.algorithms);
        }

        // If tab is active, render bars and animate them otherwise just render them
        if (this.closest(".tab-content").classList.contains("active")) {
            this.renderBars();
            this.animateBars(this.randomInts);
        } else this.renderBars();

        // Render controls
        this.renderControls();

        // Store control elements in an object for easy access
        this.controlEls = {
            start: this.querySelector("[data-start-algorithm]"),
            pause: this.querySelector("[data-pause-algorithm]"),
            input: this.querySelector("[data-bars-count-input]"),
        };

        // Event listeners
        this.addEventListener("tab-change", this.onTabChange);
        this.controlEls.start.addEventListener("click", this.onStartAlgorithm.bind(this));
        this.controlEls.pause.addEventListener("click", this.onPauseAlgorithm.bind(this));
        this.controlEls.input.addEventListener("input", window.Utils.debounce(this.onBarsCountChange.bind(this), 200));
    }

    onTabChange = () => {
        if (this.closest(".tab-content").classList.contains("active")) {
            this.animateBars(this.randomInts);
            this.removeEventListener("tab-change", this.onTabChange);
        }
    };

    setBarsCount(count) {
        return Math.max(this.minBars, Math.min(this.maxBars, count));
    }

    renderBars(update = false) {
        const barsHTML = this.randomInts.reduce(
            (html, int) => `
            ${html}
            <div class="bar" data-value="${int}"></div>
        `,
            ""
        );

        if (update) this.querySelector(".bars").innerHTML = barsHTML;
        else this.innerHTML = `<div class="bars">${barsHTML}</div>`;
    }

    renderControls() {
        this.insertAdjacentHTML(
            "beforeend",
            `
            <div class="controls">
                <button data-start-algorithm>START</button>
                <button data-pause-algorithm style="display: none;">PAUSE</button>
                <input type="number" placeholder="Bars count" value="${this.barsCount}" data-bars-count-input style="width: 150px;" min="${this.minBars}" max="${this.maxBars}" />
            </div>
        `
        );
    }

    async onStartAlgorithm() {
        this.pause = false;

        this.controlEls.pause.style.display = "inline-block";
        this.controlEls.start.style.display = "none";
        this.controlEls.input.style.display = "none";

        const generator = this.algorithm.sort(this.randomInts);

        let result = generator.next();

        while (!result.done) {
            if (this.pause) await this.playPauseAlgorithm(); // Wait for the algorithm to be resumed

            await this.animateBars(result.value);

            result = generator.next(); // Continue to the next iteration

            if (result.done) {
                this.controlEls.pause.style.display = "none";
                this.controlEls.input.style.display = "inline-block";
                this.controlEls.start.style.display = "inline-block";
            }
        }
    }

    onPauseAlgorithm(evt) {
        this.pause = !this.pause;

        if (!this.pause) {
            this.playPauseAlgorithm(true); // Resume the algorithm

            evt.currentTarget.textContent = "PAUSE";
        } else evt.currentTarget.textContent = "RESUME";
    }

    // This function will be called when the algorithm is paused or resumed
    // It will return a promise that will resolve when the algorithm is resumed
    playPauseAlgorithm(play = false) {
        // RESUME_ALGORITHM is actually the resolve function of the promise returned by playPauseAlgorithm if play === false
        if (play) {
            if (this.RESUME_ALGORITHM) {
                this.RESUME_ALGORITHM();
                this.RESUME_ALGORITHM = null;
            } else console.warn("RESUME_ALGORITHM is not defined. Algorithm is already running.");
        } else {
            // Await a never resolving promise to pause the algorithm and saving the resolve function
            return new Promise(resolve => (this.RESUME_ALGORITHM = resolve));
        }
    }

    async animateBars(arr) {
        await window.Utils.wait(BARS_ANIMATION_DELAY);

        const bars = this.querySelectorAll(".bar");
        for (let i = 0; i < arr.length; i++) {
            bars[i].style.setProperty("--height", `${window.Utils.normalize(arr[i], this.minInt, this.maxInt)}%`);
            bars[i].setAttribute("data-value", arr[i]);
        }
    }

    onBarsCountChange(evt) {
        this.barsCount = this.setBarsCount(parseInt(evt.target.value) || this.maxBars);
        this.randomInts = window.Utils.randomIntArray(this.barsCount, this.minInt, this.maxInt);

        evt.target.value = this.barsCount;

        this.renderBars(true);
        this.animateBars(this.randomInts);
    }
}

customElements.define("tabs-component", Tabs);
customElements.define("sorting-algorithm", Algorithm);
