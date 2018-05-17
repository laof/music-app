enum MssageColor {
    undefined = '#f14c4c',
    success = '#23d18b',
}

enum MssageText {
    undefined = '项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的拼写，然后再试一次；或者执行help查看帮助。'
}

class Command {
    getCommand(str, color) {
        return `<p style="color:${color};">${str}</p>`;
    }
}

export class Message extends Command {
    constructor() {
        super();
    }
    nocommand(str) {
        return this.getCommand(str + '：无法将“' + str + '”' + MssageText.undefined, MssageColor.undefined);
    }
    success(str) {
        return this.getCommand(str, MssageColor.success);
    }
}
