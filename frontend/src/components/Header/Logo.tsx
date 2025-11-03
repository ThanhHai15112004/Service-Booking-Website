import logo from '../../assets/imgs/logos/logo1.png';

export default function Logo() {
  return (
    <a href="/" className="flex items-center">
      <img 
        src={logo} 
        alt="Book Homestay" 
        className="h-12 w-35"
      />
    </a>
  );
}
