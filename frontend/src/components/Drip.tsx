import styles from './css/Viz.module.css'


export const Drip = () => {
    const d = document.querySelector('drip')
    if (d) {
        const ds = getComputedStyle(d)
        ds.cssText.

    }
    ds.style


    const stylesheet = document.styleSheets[1]
    let pos
    for (let i = 0; i < stylesheet.cssRules.length; i++) {
        if (stylesheet.cssRules[i].cssText === '.drip') {
            pos = stylesheet.cssRules[i];
        }
      }
      if (pos) {
        pos.styles.setProperty('--relative-position', '500px')
      }

    return <div className={styles.drop}></div>
}