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

        this.dispatchEvent(new CustomEvent("tab-change", { detail: { index } }));
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

    barsCount = this.setBarsCount(parseInt(this.dataset.barsCount) || Math.floor(this.maxBars));
    randomInts = window.Utils.randomIntArray(this.barsCount, this.minInt, this.maxInt);

    constructor() {
        super();
        this.renderBars();
        this.animateBars(this.randomInts);
        this.renderControls();

        this.querySelector("[data-start-algorithm]").addEventListener("click", this.onStartAlgorithm.bind(this));
        this.querySelector("[data-bars-count-input]").addEventListener("input", window.Utils.debounce(this.onBarsCountChange.bind(this), 200));
    }

    setBarsCount(count) {
        return Math.max(this.minBars, Math.min(this.maxBars, count));
    }

    renderBars(update = false) {
        (update ? this.querySelector(".bars") : this).innerHTML = `
            <div class="bars">
                ${this.randomInts.reduce(
                    (html, int) => `
                    ${html}
                    <div class="bar" data-value="${int}"></div>
                `,
                    ""
                )}
            </div>
        `;
    }

    renderControls() {
        this.insertAdjacentHTML(
            "beforeend",
            `
            <div class="controls">
                <button data-start-algorithm>START</button>
                <input type="number" placeholder="Bars count" value="${this.barsCount}" data-bars-count-input style="width: 150px;" min="${this.minBars}" max="${this.maxBars}" />
            </div>
        `
        );
    }

    async onStartAlgorithm() {
        const generator = (this.algorithm || BubbleSort).sort(this.randomInts);
        if (!this.algorithm) {
            console.error("Algorithm not defined. BubbleSort will be used as default.");
        }

        let result = generator.next();

        while (!result.done) {
            await this.animateBars(result.value);

            result = generator.next(); // Continue to the next iteration
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

class BubbleSortEl extends Algorithm {
    algorithm = BubbleSort;

    constructor() {
        super();
    }
}

class SelectionSortEl extends Algorithm {
    algorithm = SelectionSort;

    constructor() {
        super();
    }
}

class InsertionSortEl extends Algorithm {
    algorithm = InsertionSort;

    constructor() {
        super();
    }
}

class MergeSortEl extends Algorithm {
    algorithm = MergeSort;

    constructor() {
        super();
    }
}

class QuickSortEl extends Algorithm {
    algorithm = QuickSort;

    constructor() {
        super();
    }
}

class HeapSortEl extends Algorithm {
    algorithm = HeapSort;

    constructor() {
        super();
    }
}

class RadixSortEl extends Algorithm {
    algorithm = RadixSort;

    constructor() {
        super();
    }
}

class ShellSortEl extends Algorithm {
    algorithm = ShellSort;

    constructor() {
        super();
    }
}

customElements.define("tabs-component", Tabs);
customElements.define("bubble-sort", BubbleSortEl);
customElements.define("selection-sort", SelectionSortEl);
customElements.define("insertion-sort", InsertionSortEl);
customElements.define("merge-sort", MergeSortEl);
customElements.define("quick-sort", QuickSortEl);
customElements.define("heap-sort", HeapSortEl);
customElements.define("radix-sort", RadixSortEl);
customElements.define("shell-sort", ShellSortEl);
