import React from 'react'

import styles from './profile.module.scss'


// styles.monP => profile-module--monP--1MxhW

const Profile = function(props){
    return(
        <>
            <p className={styles.monP}>Profile component</p>
        </>
    )
}


export default Profile