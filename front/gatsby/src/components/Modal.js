import React from 'react'

import styles from './modal.module.scss'

export default (props) => {
  
  const defaultCancel = () => console.log("cancel")
  const cancel = props.cancel || defaultCancel
  
  return (
    <>
      <section className={styles.background} onClick={()=>cancel()}>
      </section>
      <article className={styles.modal}>
        {props.children}
        <button className={styles.secondary} onClick={()=>cancel()}> Cancel</button>
      </article>
    </>
)}