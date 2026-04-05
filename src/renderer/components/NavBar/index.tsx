import { Button } from '@/components/ui/button';

const NavBar = () => {
  return (
    <nav className="w-full h-full flex items-center justify-between px-4">
      <ul className="flex space-x-4">
        <li><a href="#" className="text-lg font-bold">Home</a></li>
        <li><a href="#" className="text-lg font-bold">Library</a></li>
        <li><a href="#" className="text-lg font-bold">Playlists</a></li>
      </ul>
      <Button size="sm">Create playlist</Button>
    </nav>
  );
}

export default NavBar;