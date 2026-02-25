import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__col">
          <h4 className="footer__heading">AJUDA</h4>
          <ul className="footer__links">
            <li><a href="#">Envios</a></li>
            <li><a href="#">Devoluções</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4 className="footer__heading">EMPRESA</h4>
          <ul className="footer__links">
            <li><a href="#">Sobre Nós</a></li>
            <li><a href="#">Sustentabilidade</a></li>
            <li><a href="#">Termos & Condições</a></li>
            <li><a href="#">Política de Privacidade</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4 className="footer__heading">NEWSLETTER</h4>
          <p className="footer__text">
            Subscreva para receber novidades e promoções exclusivas.
          </p>
          <div className="footer__newsletter">
            <input type="email" placeholder="O seu e-mail" />
            <button>→</button>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} MIL FIOS — Têxteis Premium</span>
      </div>
    </footer>
  );
}
