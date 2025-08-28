import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Rocket, Coins, BarChart3, Shield, Zap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome to Vortan
          </h1>
          <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
            The most advanced token launchpad in the galaxy. Launch your projects into the future with our space station
            dashboard and cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/projects">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 animate-glow text-lg px-8 py-3"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Explore Projects
              </Button>
            </Link>
            <Link href="/staking">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-8 py-3 bg-transparent"
              >
                <Coins className="h-5 w-5 mr-2" />
                Start Staking
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Projects Launched</div>
          </div>
          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">$2.5M+</div>
            <div className="text-muted-foreground">Total Raised</div>
          </div>
          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">10K+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/projects">
            <div className="glass-effect glow-border rounded-lg p-6 hover:animate-glow transition-all duration-300 cursor-pointer group h-full">
              <div className="flex items-center space-x-3 mb-4">
                <Rocket className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-heading text-xl font-semibold text-primary">Token Launches</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Discover and participate in cutting-edge token launches from verified projects across the galaxy.
              </p>
            </div>
          </Link>

          <Link href="/staking">
            <div className="glass-effect glow-border rounded-lg p-6 hover:animate-glow transition-all duration-300 cursor-pointer group h-full">
              <div className="flex items-center space-x-3 mb-4">
                <Coins className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                <h3 className="font-heading text-xl font-semibold text-secondary">Dual Staking</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Stake VORT and SOMI tokens to earn rewards and unlock higher allocation tiers for exclusive access.
              </p>
            </div>
          </Link>

          <Link href="/analytics">
            <div className="glass-effect glow-border rounded-lg p-6 hover:animate-glow transition-all duration-300 cursor-pointer group h-full">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                <h3 className="font-heading text-xl font-semibold text-accent">Advanced Analytics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Track project performance, market insights, and social metrics with our comprehensive dashboard.
              </p>
            </div>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="font-heading text-lg font-semibold text-primary mb-2">Secure & Audited</h4>
            <p className="text-sm text-muted-foreground">
              All smart contracts are thoroughly audited and security-tested for maximum protection.
            </p>
          </div>

          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <Zap className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h4 className="font-heading text-lg font-semibold text-secondary mb-2">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">
              Built on cutting-edge blockchain technology for instant transactions and low fees.
            </p>
          </div>

          <div className="glass-effect glow-border rounded-lg p-6 text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h4 className="font-heading text-lg font-semibold text-accent mb-2">Community Driven</h4>
            <p className="text-sm text-muted-foreground">
              Join a thriving community of innovators and early adopters shaping the future.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
