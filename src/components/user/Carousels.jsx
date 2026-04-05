import Carousel from 'react-bootstrap/Carousel';
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";
import "./Carousels.css"

function DarkVariantExample() {
  return (
   <Carousel>
  <Carousel.Item className="carousel-item-custom">
    <img
      className="carousel-img"
      src={banner1}
      alt="First slide"
    />
  </Carousel.Item>

  <Carousel.Item className="carousel-item-custom">
    <img
      className="carousel-img"
      src={banner2}
      alt="Second slide"
    />
  </Carousel.Item>

  <Carousel.Item className="carousel-item-custom">
    <img
      className="carousel-img"
      src={banner3}
      alt="Third slide"
    />
  </Carousel.Item>
</Carousel>
  );
}

export default DarkVariantExample;