interface BarrageBulletHandler {
    onClick?: Function
    onMouseEnter?: Function
    onMouseLeave?: Function
    onTransitionEnd?: Function
    onFire?: Function
}

interface BarrageOption {
    className?: string
    bulletClassName?: string
    minSize?: number
    maxSize?: number
    lineHeight?: number
    defaultSize?: number
    defaultColor?: string
    defaultOpacity?: number | string
    defaultDuration?: number
    defaultHandler?: BarrageBulletHandler
    maxConcurrence?: number
    bufferTime?: number
}

interface BarrageBullet {
    template: string
    size?: number
    color?: string
    opacity?: number | string
    duration?: number
    handler?: BarrageBulletHandler
    vi?: boolean    // very important
    ts?: number     // timestamp
}

interface BulletQueueItem {
    quote: HTMLDivElement
    bullet: BarrageBullet
}

interface ComputedQueueItem extends BulletQueueItem {
    trackCount: number
    topOffset: number
    leftOffset: number
    offsetWidth: number
    speed: number
}

interface BarrageInterface {
    init(): void
    reset(option: BarrageOption): void
    resize(): void
    shoot(bullets: BarrageBullet | Array<BarrageBullet>): void
    formatBullets(bullet: BarrageBullet, option: BarrageOption): BulletQueueItem
    flush(): void
    fire(queue: BulletQueueItem[]): void
    destroy(): void
}

interface Track {
    id: number
    topOffset: number
    count: number
    tail: number
    speed: number
    ts: number
}

interface TrackInfo {
    inAir: number | null
    sailing: boolean
    related: number
}

interface Clip {
    mode: 'COLLISION' | 'SHARE'
    pop(count: number, toBeContinue: boolean, speed?: number): number
}