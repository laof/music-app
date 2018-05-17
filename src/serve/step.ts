

export class Step {

    private step: any[] = [];

    private index = -1;

    private max = 6;

    constructor() { }

    add(obj) {


        if (this.step[this.index] === obj) {
            return;
        }

        this.step.splice(++this.index, 0, obj);

        this.step.splice(this.index + 1, this.step.length - 1 - this.index); // 保持当前操作为最新步骤，不支持反撤销


        if (this.step.length > this.max) {
            this.step.shift();
            this.index = this.step.length - 1;
        }


    }

    goBack() {
        if (this.index > 0) {
            --this.index;
            return this.step[this.index];
        } else {
            return false;
        }
    }

    goTo() {

        const lasti = this.step.length - 1;

        if (this.index !== lasti && this.index !== -1) {
            ++this.index;
            return this.step[this.index];
        } else {
            return false;
        }

    }

    clear() {
        this.step = [];
        this.index = -1;
    }

}
