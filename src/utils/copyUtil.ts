export function copyText(text: string): Promise<void> {
    // 现代 API：只在安全上下文存在
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
    }

    // 降级方案：兼容 http / IP / 内网 / Windows
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        document.body.appendChild(textarea)

        textarea.focus()
        textarea.select()

        try {
            const success = document.execCommand('copy')
            success ? resolve() : reject()
        } catch (err) {
            reject(err)
        } finally {
            document.body.removeChild(textarea)
        }
    })
}