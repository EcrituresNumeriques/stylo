import React, { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'

import styles from './Sidebar.story.module.scss'

export default function SidebarStory() {
  const [opened, setOpened] = useState(false)
  return (
    <div className={styles.container}>
      <section>
        <p>
          Proin pulvinar felis vitae commodo volutpat. Ut ut purus felis. Donec
          blandit faucibus odio, a pulvinar turpis pharetra quis. Aenean
          ultricies venenatis arcu, nec malesuada libero ornare nec. Sed
          faucibus quam eget placerat accumsan. Aenean ut elementum arcu. Nulla
          tortor dolor, scelerisque at porta placerat, tincidunt nec enim.
          Phasellus dictum lacinia vestibulum. Aenean vestibulum arcu a ex
          molestie, sit amet mattis magna ultrices. Nulla quam nibh, cursus ut
          neque eget, imperdiet mattis ipsum.
        </p>

        <p>
          Curabitur viverra, lorem hendrerit fringilla ornare, ex libero
          tincidunt sapien, in malesuada eros eros sit amet urna. Sed porta eu
          quam sit amet rhoncus. Sed imperdiet, nulla eu venenatis congue, orci
          mi fermentum magna, in cursus eros lectus quis ex. Nullam interdum
          bibendum congue. Donec sit amet mattis libero. Vivamus suscipit risus
          at diam hendrerit pulvinar. Curabitur tristique arcu vel tincidunt
          rutrum. Integer placerat, metus vitae vestibulum eleifend, felis mi
          fringilla tellus, a efficitur erat risus vitae augue. Nunc tincidunt,
          lectus eu volutpat suscipit, augue est vestibulum tortor, sed sodales
          quam elit at enim. Integer ut felis id justo pretium condimentum.
          Phasellus lobortis vel ipsum sit amet pulvinar. Donec vehicula
          molestie lorem sed lobortis. Proin suscipit pharetra arcu, varius
          scelerisque enim porta pellentesque.
        </p>
      </section>
      <Sidebar opened={opened} setOpened={setOpened}>
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
            rutrum velit nisl, sit amet iaculis tortor scelerisque in. Nam sed
            tellus tincidunt, efficitur nunc quis, consequat metus. Maecenas
            vestibulum mauris ut tristique aliquam. Quisque at sodales nisi, eu
            molestie arcu. Vivamus lobortis, risus eu ultrices viverra, libero
            ligula fringilla elit, ac pellentesque augue neque in nibh. Sed
            lacinia pharetra ipsum eget iaculis. Aenean a pulvinar tortor. Sed
            ut porttitor libero. Sed vitae dui non libero venenatis vulputate id
            eget erat. Vivamus lorem ex, fringilla quis efficitur et, venenatis
            tristique nunc. Ut blandit tempor turpis, nec dignissim sem
            pellentesque vitae. Aliquam malesuada, orci ac semper cursus, turpis
            dolor imperdiet tortor, id interdum velit nibh sit amet diam.
            Interdum et malesuada fames ac ante ipsum primis in faucibus.
          </p>

          <p>
            Duis sodales massa a iaculis vehicula. Aenean porttitor, eros vel
            auctor semper, nunc augue feugiat lectus, sit amet sagittis orci
            turpis sed leo. Duis vestibulum pulvinar quam, nec fermentum nisi
            interdum eget. Nam nec augue nec odio tempor rhoncus sit amet ut
            magna. Suspendisse potenti. Sed ut urna ac nulla commodo volutpat.
            Nulla efficitur mollis venenatis. Vestibulum vehicula nulla sed
            vulputate sagittis. Suspendisse potenti. Pellentesque arcu massa,
            cursus et maximus nec, auctor vel sapien. Nulla facilisi. Ut ac
            laoreet ex.
          </p>
        </div>
      </Sidebar>
    </div>
  )
}
