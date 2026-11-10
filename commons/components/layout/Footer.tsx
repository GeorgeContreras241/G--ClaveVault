import GitHub from '../icons/GitHub';
import Linkedin from '../icons/LinkedIn';

import { ThemeToggle } from '@/commons/components/shared/ThemeToggle';

export const Footer = ({ className }: { className?: string }) => {
  return (
    <footer
      className={
        className ??
        'vault-panel flex m-auto max-w-6xl w-full justify-center rounded-lg px-4 py-1.5 mt-auto'
      }
      aria-label="Enlaces y preferencias"
    >
      <div className="w-full  flex items-center justify-between gap-4">
        <p className="hidden text-meta font-medium tracking-meta uppercase sm:block text-muted-foreground">
          ClaveVault · local first
        </p>

        <div className="flex items-center gap-1 sm:ml-auto sm:justify-end ">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300
                hover:text-vault-amber text-muted-foreground"
          >
            <span className="sr-only">GitHub</span>
            <GitHub />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:text-vault-amber text-muted-foreground"
          >
            <span className="sr-only">LinkedIn</span>
            <Linkedin />
          </a>
          <div className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:text-vault-amber text-muted-foreground">
            <ThemeToggle className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
