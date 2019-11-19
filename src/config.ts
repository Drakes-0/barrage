export const defaultBarrageOption: BarrageOption = {
    className: 'barrage-wrapper',
    bulletClassName: 'barrage-bullet',
    minSize: 12,
    maxSize: 24,
    lineHeight: 1,
    defaultSize: 14,
    defaultColor: '#FFFFFF',
    defaultOpacity: 1,
    defaultDuration: 15000,
    maxConcurrence: 200,
    bufferTime: 250
}

export function createCSSRules(option: BarrageOption, width: number): string[] {
    const { className, bulletClassName, defaultSize, lineHeight, defaultColor, defaultOpacity, defaultDuration } = option

    return [
        `.${className}{position:relative;pointer-events:none;overflow:hidden}`,
        `.${className} .${bulletClassName}{position:absolute;`
        + `top:0;left:${width}px;transform:translateX(0);`
        + `font-size:${defaultSize}px;color:${defaultColor};opacity:${defaultOpacity};`
        + `transition-property:transform;transition-timing-function:linear;transition-delay:0s;`
        + `line-height:${lineHeight}em;transition-duration:${defaultDuration}ms}`
    ]
}
