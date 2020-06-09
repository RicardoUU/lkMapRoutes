// 全排序
export class Permutation {
    constructor(arr) {
        this.arr = Array.from(arr);
        this.result = [];
        this.len = 0;
        this.run(0);
    }

    run(index) {
        if (index == this.arr.length - 1) {
            this.result.push(Array.from(this.arr));
            this.len++;
            return;
        }
        for (let i = index; i < this.arr.length; i++) {
            [this.arr[index], this.arr[i]] = [this.arr[i], this.arr[index]];
            this.run(index + 1);
            [this.arr[index], this.arr[i]] = [this.arr[i], this.arr[index]];
        }
    }
}
// 排列
export function combo(arr, num) {
    var result = [];
    var range = function (r, _arr) {
        if (r.length == num) {
            result.push(r)
        } else {
            let l = r.length;
            for (var i = 0, len = _arr.length - num + l; i <= len; i++) {
                range(r.concat(_arr[i]), _arr.slice(i + 1))
            }
        }
    }
    range([], arr);
    return result
}