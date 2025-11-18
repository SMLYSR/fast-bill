import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.dailyFlow}>
      <div className={styles.container}>
        <img src="../image/mi3aexf8-10s7ppp.svg" className={styles.icon} />
        <div className={styles.heading3}>
          <p className={styles.text}>上传收支截图</p>
        </div>
        <div className={styles.paragraph}>
          <p className={styles.text2}>AI 一键记录</p>
        </div>
        <div className={styles.button}>
          <p className={styles.text3}>选择图片</p>
        </div>
      </div>
      <img src="../image/mi3aexf8-ml7sqxp.svg" className={styles.icon2} />
    </div>
  );
}

export default Component;
