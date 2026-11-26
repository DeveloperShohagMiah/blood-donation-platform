import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Droplets, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import LoginForm from "@/components/LoginForm";

/**
 * Navbar sign-in popup. Reuses the exact form from the full /login page,
 * but keeps the visitor on the page they were browsing.
 */
export default function LoginDialog({ children }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[26rem] rounded-[1.5rem] border-border/70 p-0 [&>button:last-child]:hidden">
                <BackgroundGradient containerClassName="w-full rounded-[1.5rem]">
                    <div className="bg-gradient relative rounded-[1.25rem] p-6 sm:p-8">
                        <DialogClose asChild>
                            <button
                                type="button"
                                aria-label={t("navigation.close", "Close")}
                                className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X size={16} />
                            </button>
                        </DialogClose>

                        <DialogHeader>
                            <span className="mb-2 grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg shadow-primary/25">
                                <Droplets size={22} strokeWidth={2.2} />
                            </span>
                            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
                                {t("cmsLogin.title", "Welcome back")}
                            </DialogTitle>
                            <DialogDescription>
                                {t("cmsLogin.subtitle", "Sign in to manage your donations and requests.")}
                            </DialogDescription>
                        </DialogHeader>
    
                        <LoginForm
                            onSuccess={() => setOpen(false)}
                            navigateOnSuccess={false}
                            showSessionExpired={false}
                        />
    
                        <div className="mt-6 border-t border-border pt-5 text-center">
                            <p className="text-[0.8rem] text-muted-foreground">
                                {t("cmsLogin.noAccount", "Need an account?")}
                            </p>
                            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                                <Link to="/become-donor" onClick={() => setOpen(false)}>
                                    {t("navigation.becomeDonor", "Become a donor")}
                                    <ArrowUpRight size={16} />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </BackgroundGradient>
            </DialogContent>
        </Dialog>
    );
}
