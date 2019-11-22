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

enum CLIP_MODE {
    COLLISION = 'COLLISION',
    SHARE = 'SHARE'
}

export function createClip(originalTracks: Array<Track>, timestamp: number, elWidth: number, computedTracks: number): Clip {
    const length = originalTracks.length
    const tracks = originalTracks.slice(0)

    if (computedTracks <= length) {
        const tracksInfo: TrackInfo[] = Array.from({ length }, () => ({
            inAir: null,
            sailing: false,
            related: 0
        }))

        return {
            mode: CLIP_MODE.COLLISION,
            pop(count: number, toBeContinue: boolean, speed: number) {
                const limit = length - count + 1
                let target
                let backup

                for (let i = 0; i < limit;) {
                    if (tracksInfo[i].sailing) {
                        i += tracksInfo[i].related
                        continue
                    }

                    void 0 === backup && (backup = i)

                    if (!tracks[i].count || (
                        (
                            tracksInfo[i].inAir === null && (tracksInfo[i].inAir = tracks[i].speed * (timestamp - tracks[i].ts) - tracks[i].tail),
                            tracksInfo[i].inAir > 0
                        ) && (
                            tracks[i].speed >= speed || tracksInfo[i].inAir >= elWidth * (1 - (tracks[i].speed / speed))
                        )
                    )) {
                        target = i
                        break
                    }

                    i++
                }

                void 0 === target && (target = backup || 0)

                if (toBeContinue) {
                    const trackInfo = tracksInfo[target]
                    trackInfo.sailing = true
                    count > trackInfo.related && (trackInfo.related = count)
                }

                return target
            }
        }
    } else {
        tracks.sort((a, b) => (a.count - b.count) || (a.id - b.id))
        let standby: Array<number> = tracks.map(t => t.id)

        return {
            mode: CLIP_MODE.SHARE,
            pop(count: number, toBeContinue: boolean) {
                let target = standby[0]
                const overflow = target + count - length
                overflow > 0 && (target -= overflow)

                if (toBeContinue) {
                    const bubbles = [standby.shift()]

                    if (count > 1) {
                        const computed = target + count
                        const limit = length - 1

                        for (let i = 0; i < limit; i++) {
                            if (standby[i] >= target && standby[i] < computed) {
                                if (bubbles.push(standby.splice(i, 1)[0]) === count) {
                                    break
                                }
                                i--
                            }
                        }
                    }

                    standby = standby.concat(bubbles)
                }

                return target
            }
        }
    }
}