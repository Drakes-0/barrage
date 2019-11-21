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

export function multiBubble(tracks: Array<Track>, size: number): Array<Track> {
    const bubbles = [tracks.shift()]
    const length = tracks.length

    if (size > 1) {
        let ti = bubbles[0].id

        for (let i = 0; i < length; i++) {
            if (tracks[i].id < ti + size) {
                if (bubbles.push(tracks.splice(i, 1)[0]) === size) {
                    break
                } else {
                    i--
                }
            }
        }
    }

    return tracks.concat(bubbles)
}