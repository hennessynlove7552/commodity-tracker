import styles from './Loading.module.css';

interface LoadingProps {
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = '로딩 중...' }) => {
    return (
        <div className={styles.loading}>
            <div className={styles.spinner} />
            <p className={styles.text}>{text}</p>
        </div>
    );
};
