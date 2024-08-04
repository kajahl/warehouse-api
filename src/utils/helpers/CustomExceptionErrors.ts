const usedErrorCodes = new Set<number>();

export function UndefinedErrorOccurred(code: number) : string {
    if(usedErrorCodes.has(code)) throw new Error(`Error code ${code} is already used`);
    usedErrorCodes.add(code);
    const codeString = code.toString().padStart(5, '0');
    return `An undefined error occured with code ${codeString}`
}
