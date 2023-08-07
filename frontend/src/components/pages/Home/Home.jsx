import styles from "./Home.module.css";
function Home() {
  return (
    <div>
      <div className={styles.header}>Latest Articles</div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <img alt="" />
          <h3>Title</h3>
        </div>
      </div>
    </div>
  );
}

export default Home;
