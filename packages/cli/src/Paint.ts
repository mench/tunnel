export enum Color {
    RED = 31,
    RED_FG = 41,
    GREEN = 32,
    GREEN_FG = 42,
    YELLOW = 33,
    YELLOW_FG = 43,
    BLUE = 34,
    BLUE_FG = 44,
    MAGENTA = 35,
    MAGENTA_FG = 45,
    CYAN = 36,
    CYAN_FG = 46,
    LGRAY = 37,
    LGRAY_FG = 47,
    GRAY = 90,
    GRAY_FG = 100,

}

export class Paint {

    static bold(text) {
        return `\u{1b}[1m${text}\u{1b}[0m`;
    }

    static dim(text) {
        return `\u{1b}[2m${text}\u{1b}[0m`;
    }

    static underline(text) {
        return `\u{1b}[4m${text}\u{1b}[0m`;
    }

    static color(text: string, color: Color) {
        return `\u{1b}[${color}m${text}\u{1b}[0m`;
    }

    static c(text: string, color: number, bg: boolean = true) {
        return `\u{1b}[${bg ? 48 : 38};5;${color}m${text}\u{1b}[0m`;
    }

    static red(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.RED : Color.RED_FG);
    }

    static green(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.GREEN : Color.GREEN_FG);
    }

    static yellow(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.YELLOW : Color.YELLOW_FG);
    }

    static blue(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.BLUE : Color.BLUE_FG);
    }

    static magenta(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.MAGENTA : Color.MAGENTA_FG);
    }

    static cyan(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.CYAN : Color.CYAN_FG);
    }

    static gray(text: string, bg?: boolean) {
        return this.color(text, !bg ? Color.GRAY : Color.GRAY_FG);
    }
}