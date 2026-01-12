export function Footer() {
    return (
         <footer className="border-t border-border bg-muted/50 py-12 px-4">
            <div className="container mx-auto max-w-6xl">

                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
                </div>
            </div>
         </footer>
    )
}
