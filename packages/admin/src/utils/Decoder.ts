export class Decoder {

    static base64ToArrayBuffer(base64: string) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    static fromBase64(base64: string) {
        const decoder = new TextDecoder();
        const buffer = this.base64ToArrayBuffer(base64);
        return decoder.decode(buffer);
    }
}