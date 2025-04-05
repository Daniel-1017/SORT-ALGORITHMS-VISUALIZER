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
    barsCount = this.dataset.barsCount ?? 50;
    randomInts = window.Utils.randomIntArray(this.barsCount, 5, 101);

    constructor() {
        super();
        this.renderBars();
        this.animateBars(this.randomInts);

        this.querySelector("[data-start-algorithm]").addEventListener("click", this.onStartAlgorithm.bind(this));
    }

    renderBars() {
        this.innerHTML = `
            <div class="bars">
                ${this.randomInts.reduce(
                    (html, int) => `
                    ${html}
                    <div class="bar">${int}</div>
                `,
                    ""
                )}
            </div>
            <div class="controls">
                <button data-start-algorithm>START</button>
                <input type="number" placeholder="Bars count" />
            </div>
        `;

        // ! TODO: Add event listener to input to change the number of bars
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
            bars[i].style.setProperty("--height", `${arr[i]}%`);
            bars[i].textContent = arr[i];
        }
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

customElements.define("tabs-component", Tabs);
customElements.define("bubble-sort", BubbleSortEl);
customElements.define("selection-sort", SelectionSortEl);
customElements.define("insertion-sort", InsertionSortEl);
customElements.define("merge-sort", MergeSortEl);
customElements.define("quick-sort", QuickSortEl);
customElements.define("heap-sort", HeapSortEl);
customElements.define("radix-sort", RadixSortEl);
