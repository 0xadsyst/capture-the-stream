export const timeRemaining = (secondsRemaining: number) => {
    const days = Math.floor(secondsRemaining / (60 * 60 * 24))
    const hours = Math.floor((secondsRemaining - days * (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60)) / 60)
    const seconds = secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60) - minutes * 60
    const timeRemaining =
      secondsRemaining > 0
        ? days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds'
        : 'Round ended'

        return timeRemaining
}