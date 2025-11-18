import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.minimalistFinancialD}>
      <div className={styles.container}>
        <div className={styles.text2}>
          <p className={styles.text}>每</p>
        </div>
        <div className={styles.text3}>
          <p className={styles.text}>日</p>
        </div>
        <div className={styles.text3}>
          <p className={styles.text}>一</p>
        </div>
        <div className={styles.text3}>
          <p className={styles.text}>记</p>
        </div>
        <img src="../image/mi1wy746-tf0jyt9.svg" className={styles.icon} />
      </div>
      <div className={styles.paragraph}>
        <p className={styles.text4}>简洁记录，智慧理财</p>
      </div>
      <div className={styles.container3}>
        <div className={styles.loginPage}>
          <img src="../image/mi1wy746-d5tf3zn.svg" className={styles.icon2} />
          <p className={styles.text5}>用户名</p>
        </div>
        <div className={styles.loginPage2}>
          <img src="../image/mi1wy746-in1pt6q.svg" className={styles.icon2} />
          <p className={styles.text5}>密码</p>
        </div>
        <div className={styles.loginPage3}>
          <p className={styles.text6}>登录</p>
        </div>
        <div className={styles.loginPage4}>
          <div className={styles.container2} />
          <div className={styles.text8}>
            <p className={styles.text7}>或</p>
          </div>
          <div className={styles.container2} />
        </div>
        <div className={styles.button}>
          <img src="../image/mi1wy746-sulkmnl.svg" className={styles.loginPage5} />
          <p className={styles.text9}>使用 Apple ID 授权登录</p>
        </div>
        <div className={styles.loginPage6}>
          <div className={styles.primitiveButton} />
          <div className={styles.label}>
            <p className={styles.text10}>我已阅读并同意</p>
            <div className={styles.text12}>
              <p className={styles.text11}>用户协议</p>
            </div>
            <p className={styles.text13}>和</p>
            <div className={styles.text14}>
              <p className={styles.text11}>隐私政策</p>
            </div>
          </div>
        </div>
        <div className={styles.loginPage7}>
          <p className={styles.text15}>登录即表示您同意我们的服务条款</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
