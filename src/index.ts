import { defaultBarrageOption, createCSSRules } from './config'
import { injectCSS, nextTick, multiBubble } from './util'

class Barrage implements BarrageInterface {
    private el: HTMLElement

    private option: BarrageOption

    private width: number

    private height: number

    private tracks: Array<Track>

    private currentBullets: number = 0

    private bufferTimer: any = 0

    private bufferQueue: BarrageBullet[] = []

    constructor(root: HTMLElement, option: BarrageOption) {
        option = Object.assign({}, defaultBarrageOption, option)
        if (root.getElementsByClassName(option.className).length) {
            throw new Error('[Barrage Error]: DUPLICATED')
        }

        const el = document.createElement('div')
        el.classList.add(option.className)
        el.setAttribute('style', 'height:100%')
        root.appendChild(el)
        this.option = option
        this.el = el
        this.init()
    }

    init() {
        const { width, height } = this.el.getBoundingClientRect()
        this.width = width
        this.height = height

        const rules = createCSSRules(this.option, this.width)
        injectCSS(rules)

        const { minSize, lineHeight } = this.option
        const trackHeight = minSize * lineHeight
        this.tracks = Array.from({ length: Math.floor(this.height / trackHeight) },
            (u, i) => ({ id: i, topOffset: i * trackHeight, count: 0, tail: 0, speed: 0, ts: 0 }))
    }

    reset(option: BarrageOption) {

    }

    resize() {

    }

    shoot(bullets: BarrageBullet | BarrageBullet[]) {
        if (!bullets || (Array.isArray(bullets) && !bullets.length)) {
            return
        }

        Array.isArray(bullets) ? this.bufferQueue = this.bufferQueue.concat(bullets) : this.bufferQueue.push(bullets)

        !this.bufferTimer && (this.bufferTimer = setTimeout(this.flush.bind(this), this.option.bufferTime))
    }

    flush() {
        const bullets = this.bufferQueue.slice(0)
        this.bufferTimer = this.bufferQueue.length = 0

        const { maxConcurrence } = this.option
        let rate = 0
        let count

        if (count = bullets.length + this.currentBullets, count > maxConcurrence) {
            rate = (count - maxConcurrence) / bullets.length
        }

        const frag = document.createDocumentFragment()
        const quotes = []

        bullets.forEach(b => {
            if (rate && !b.vi && Math.random() > rate) {
                return
            }

            const queueItem = this.formatBullets(b, this.option)
            quotes.push(queueItem)
            frag.appendChild(queueItem.quote)
        })

        this.currentBullets += quotes.length
        this.el.appendChild(frag)

        nextTick(this.fire.bind(this, quotes))
    }

    formatBullets(bullet: BarrageBullet, option: BarrageOption): BulletQueueItem {
        const { template, size, color, opacity, duration, handler } = bullet
        const { bulletClassName, minSize, maxSize, defaultSize, defaultDuration, defaultHandler } = option

        const style = [
            size ? `font-size:${size < minSize ? (bullet.size = minSize) : (size > maxSize ? (bullet.size = maxSize) : size)}px;` : (bullet.size = defaultSize, ''),
            color ? `color:${color};` : '',
            opacity ? `opacity:${opacity};` : '',
            duration ? `transition-duration:${duration}ms;` : (bullet.duration = defaultDuration, '')
        ].join('')

        const quote = document.createElement('div')
        quote.classList.add(bulletClassName)
        quote.innerHTML = template
        style && quote.setAttribute('style', style)

        const onClick = (handler && handler.onClick) || (defaultHandler && defaultHandler.onClick)
        onClick && quote.addEventListener('click', onClick as any)

        return { quote, bullet }
    }

    fire(queue: BulletQueueItem[]) {
        // two-side waterfall
        const timestamp = +new Date
        const elWidth = this.width
        const originalTracks = this.tracks
        const trackSize = this.option.minSize

        let computedTracks = 0
        const computedQueue: ComputedQueueItem[] = queue.map(i => {
            const { quote, bullet } = i
            const { size, duration } = bullet
            const { offsetWidth } = quote
            const trackCount = Math.ceil(size / trackSize)
            const topOffset = (trackCount * trackSize - size) / 2
            const leftOffset = elWidth + offsetWidth
            const speed = leftOffset / duration

            computedTracks += trackCount

            return { quote, bullet, trackCount, topOffset, leftOffset, offsetWidth, speed }
        })

        // computedQueue.sort((a, b) => a.trackCount - b.trackCount)

        const ql = computedQueue.length
        const tl = originalTracks.length

        const shareMode = computedTracks > tl
        let index = 0
        let tracks: Track[] = originalTracks.slice(0)
        let tracksInfo: TrackInfo[]

        if (!shareMode) {
            tracksInfo = Array.from({ length: tl }, (v, i) => ({
                id: i,
                inAir: null,
                sailing: false,
                related: 0
            }))
        } else {
            tracks.sort((a, b) => {
                return (a.count - b.count) || (a.id - b.id)
            })
        }

        while (index < ql) {
            const queueItem = computedQueue[index++]
            let { quote, trackCount, offsetWidth, speed, topOffset, leftOffset } = queueItem

            let targetTrack
            if (!shareMode) {
                let limit = tl - trackCount + 1
                let backup
                for (let i = 0; i < limit;) {
                    if (tracksInfo[i].sailing) {
                        i += tracksInfo[i].related
                        continue
                    }

                    void 0 === backup && (backup = i)

                    if (
                        !tracks[i].count || (
                            (
                                tracksInfo[i].inAir === null && (tracksInfo[i].inAir = tracks[i].speed * (timestamp - tracks[i].ts) - tracks[i].tail),
                                tracksInfo[i].inAir > 0
                            ) && (
                                tracks[i].speed >= queueItem.speed || tracksInfo[i].inAir >= elWidth * (1 - (tracks[i].speed / queueItem.speed))
                            )
                        )
                    ) {
                        targetTrack = i
                        break
                    }

                    i++
                }

                void 0 === targetTrack && (targetTrack = backup || 0)// undefined || 0 || 0
                tracksInfo[targetTrack].sailing = true
                trackCount > tracksInfo[targetTrack].related && (tracksInfo[targetTrack].related = trackCount)
            } else {
                targetTrack = tracks[0].id
                const overflow = targetTrack + trackCount - tl
                overflow > 0 && (targetTrack -= overflow)
                index < ql && (tracks = multiBubble(tracks, trackCount))
            }

            let sailingTracks = originalTracks.slice(targetTrack, targetTrack + trackCount)

            sailingTracks.forEach(t => {
                t.count++
                t.tail = offsetWidth
                t.speed = speed
                t.ts = timestamp
            })

            quote.setAttribute('style', (quote.getAttribute('style') || '')
                + `top:${sailingTracks[0].topOffset + topOffset}px;transform:translateX(-${leftOffset}px)`)

            quote.addEventListener('transitionend', () => {
                this.currentBullets--
                sailingTracks.forEach(t => {
                    t.count--
                })
                quote.remove()
                sailingTracks = quote = null
            })
        }
    }

    destroy() {

    }
}

export default Barrage