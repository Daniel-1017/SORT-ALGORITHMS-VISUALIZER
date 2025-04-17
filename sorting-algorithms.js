class BubbleSort {
    static *sort(arr) {
        let n = arr.length;
        let swapped;

        do {
            swapped = false;
            for (let i = 1; i < n; i++) {
                if (arr[i - 1] > arr[i]) {
                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                    swapped = true;
                }
            }

            yield arr;

            n--;
        } while (swapped);

        return arr;
    }
}

class SelectionSort {
    static *sort(arr) {
        let n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            let minIndex = i;

            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }

            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

                yield arr;
            }
        }

        return arr;
    }
}

class InsertionSort {
    static *sort(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
                yield arr;
            }

            arr[j + 1] = key;

            yield arr;
        }

        return arr;
    }
}

class RadixSort {
    static *sort(arr) {
        if (arr.length === 0) return arr;

        const getMaxDigits = nums => Math.max(...nums).toString().length;
        const getDigit = (num, place) => Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;

        const maxDigits = getMaxDigits(arr);

        for (let k = 0; k < maxDigits; k++) {
            const buckets = Array.from({ length: 10 }, () => []);

            for (const num of arr) {
                const digit = getDigit(num, k);
                buckets[digit].push(num);
            }

            arr = buckets.flat();

            yield arr;
        }

        return arr;
    }
}

class HeapSort {
    static *sort(arr) {
        const n = arr.length;

        function* heapify(arr, n, i) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && arr[left] > arr[largest]) largest = left;
            if (right < n && arr[right] > arr[largest]) largest = right;

            if (largest !== i) {
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                yield [...arr];
                yield* heapify(arr, n, largest);
            }
        }

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* heapify(arr, n, i);
        }

        // Heap sort
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            yield [...arr];
            yield* heapify(arr, i, 0);
        }

        return arr;
    }
}

class QuickSort {
    static *sort(arr) {
        if (arr.length <= 1) return arr;

        const pivot = arr[arr.length - 1];
        const left = [];
        const right = [];

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] < pivot) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }

        const leftSorted = yield* QuickSort.sort(left);
        const rightSorted = yield* QuickSort.sort(right);

        const newArr = [...leftSorted, pivot, ...rightSorted];

        yield newArr;

        return newArr;
    }
}

class MergeSort {
    static *sort(arr) {
        if (arr.length <= 1) {
            yield arr; // Visualize base case
            return arr;
        }

        const mid = Math.floor(arr.length / 2);
        const left = yield* MergeSort.sort(arr.slice(0, mid));
        const right = yield* MergeSort.sort(arr.slice(mid));

        const merged = yield* MergeSort.merge(left, right);
        return merged;
    }

    static *merge(left, right) {
        const result = [];
        let i = 0,
            j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
            yield result.concat(left.slice(i)).concat(right.slice(j)); // Yield step by step
        }

        const final = result.concat(left.slice(i)).concat(right.slice(j));
        yield final; // Final merge of this level
        return final;
    }
}

class ShellSort {
    static *sort(arr) {
        let n = arr.length;
        let gap = Math.floor(n / 2);

        while (gap > 0) {
            for (let i = gap; i < n; i++) {
                let temp = arr[i];
                let j = i;

                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                    yield arr;
                }

                arr[j] = temp;
                yield arr;
            }

            gap = Math.floor(gap / 2);
        }

        return arr;
    }
}

window.algorithms = {
    BubbleSort,
    SelectionSort,
    InsertionSort,
    RadixSort,
    HeapSort,
    QuickSort,
    MergeSort,
    ShellSort,
};
