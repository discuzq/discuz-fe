import styles from './index.module.scss';
export default function SiteMapLink(props) {
    const { href, text = '' } = props;
    return (
        <a href={href} className={styles['site-map-link']}>{text.slice(0, 20)}</a>
    );

}