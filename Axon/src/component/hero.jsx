import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";

export default function Hero() {

const navigate = useNavigate();

  const controls = useAnimation();
  const handleClick = () => {
    controls.start({
      scale: 1.1,
      transition: { duration: 0.3 },
    });

    setTimeout(() => {
        navigate("/signup");
      }, 600);
  };

  return (
    <>
    <div className="hero_container">
        <div style={{display: 'flex',flexDirection: 'column', gap: '2rem', flex: '1', margin: '7rem 0rem'}}>
            <div>
                <h1>Master Your Concepts with Ease</h1>
                <p>Test your knowledge and learn new concepts from any Domain</p>
            </div>

            <div>
                <motion.button
                    className="get_started_button"
                    whileTap={{ scale: 0.9 }}
                    animate={controls}
                    onClick={handleClick}>
                    Get Started
                </motion.button>
            </div>
        </div>

        <div className="img_axon_pipe" >
            <img src="./axon_pipe.png" alt="" className="pipe_image"></img>
        </div>
    </div>
    </>
  )
}
