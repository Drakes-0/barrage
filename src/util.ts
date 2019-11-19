export function injectCSS(rules: string[]): void {
    const style: HTMLStyleElement = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(
        document.createTextNode(rules.join(''))
    )
        ; (document.head || document.getElementsByTagName('head')[0]).appendChild(style)
}

export function nextTick(callback: Function): void {
    setTimeout(callback, 0)
}

export const IS_TRANSITION_SUPPORTED = void 0 !== document.body.style['transition']