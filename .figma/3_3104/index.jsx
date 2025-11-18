import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.dailyFlow}>
      <div className={styles.container6}>
        <div className={styles.heading3}>
          <p className={styles.text}>手动记账</p>
        </div>
        <div className={styles.container}>
          <div className={styles.button}>
            <p className={styles.text2}>支出</p>
          </div>
          <div className={styles.button2}>
            <p className={styles.text2}>收入</p>
          </div>
        </div>
        <div className={styles.container2}>
          <div className={styles.text3}>
            <p className={styles.a}>¥</p>
          </div>
          <div className={styles.input}>
            <p className={styles.text4}>金额</p>
          </div>
        </div>
        <div className={styles.container3}>
          <img src="../image/mi3aqd2i-5orecoz.svg" className={styles.icon} />
        </div>
        <div className={styles.container4}>
          <img src="../image/mi3aqd2i-ef1g1je.svg" className={styles.icon2} />
          <div className={styles.input2}>
            <p className={styles.text4}>类别</p>
          </div>
        </div>
        <div className={styles.container4}>
          <img src="../image/mi3aqd2i-oasd1o4.svg" className={styles.icon2} />
          <div className={styles.input2}>
            <p className={styles.text4}>地点</p>
          </div>
        </div>
        <div className={styles.container5}>
          <img src="../image/mi3aqd2i-y2rxol9.svg" className={styles.icon3} />
          <div className={styles.textarea}>
            <p className={styles.text5}>备注</p>
          </div>
        </div>
        <div className={styles.button3}>
          <p className={styles.text6}>保存</p>
        </div>
      </div>
      <img src="../image/mi3aqd2i-390giep.svg" className={styles.icon4} />
    </div>
  );
}

export default Component;
