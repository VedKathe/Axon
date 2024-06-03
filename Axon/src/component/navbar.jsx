import { Link, useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";

export default function Navbar() {

const navigate = useNavigate();

  const controls = useAnimation();
  const handleClick = () => {
    controls.start({
      scale: 1.1,
      transition: { duration: 0.3 },
    });

    setTimeout(() => {
        navigate("/dashboard");
      }, 600);
  };

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem'}}>
        <div style={{fontFamily: 'Kanit, sans-serif', fontWeight: '800', fontStyle: 'italic'}}>
          <Link to="/" style={{color: 'black', textDecoration: 'none', fontSize: '1.4rem', cursor: 'pointer'}}>AXON</Link>
        </div>
        <div style={{display: 'flex', gap: '1.6rem', alignItems: 'center'}}>
          <Link className="login_hover" to="/signup">Login</Link>
          
          <motion.button
            className="get_started_button"
            whileTap={{ scale: 0.9 }}
            animate={controls}
            onClick={handleClick}>
            Get Started
          </motion.button>
        </div>
      </div>
    </>
  );
}
