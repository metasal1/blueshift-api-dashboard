"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Activity, Users, TrendingUp, Award, Zap, Package } from "lucide-react"

interface User {
  user_address: string
  total_mints: number
  first_mint_date: string
  last_mint_date: string
}

interface Collection {
  address: string
  name: string
  supply: number
}

interface ApiStats {
  total: number
  collections: Collection[]
}

interface ApiData {
  users?: User[]
  collections?: Collection[]
  stats?: ApiStats
  mints?: any[]
  totals?: any[]
}

// Sample data based on the API structure
const userData = [
  {
    user_address: "82Kt7Lh67mYhazF2btx8P36xJXB7dE4t5yNFay2fDjZV",
    total_mints: 12,
    first_mint_date: "2025-07-09",
    last_mint_date: "2025-08-17",
  },
  {
    user_address: "52qRER5VyGpF77QHf528zf78xyCkf1yC19ouTLUfH7VA",
    total_mints: 12,
    first_mint_date: "2025-05-23",
    last_mint_date: "2025-08-09",
  },
  {
    user_address: "68BW8o87upBXnVYbif5nBfa1omXuL7iuTnRfpFqV99be",
    total_mints: 12,
    first_mint_date: "2025-08-05",
    last_mint_date: "2025-08-11",
  },
  {
    user_address: "CMMUMzTZJb9NMdwwNjNrMVvVPRDqcHicNaEajgxGoqxn",
    total_mints: 12,
    first_mint_date: "2025-05-22",
    last_mint_date: "2025-08-09",
  },
  {
    user_address: "ADjoTuHWvJbGq3E2GQmK3ZYsB8KqoNmfFWFarxVRKnzf",
    total_mints: 11,
    first_mint_date: "2025-05-27",
    last_mint_date: "2025-08-12",
  },
  {
    user_address: "8guPL7pGBHx2aFEQfSTsnPjtM7svf8ikeiTQCmUo4ezD",
    total_mints: 9,
    first_mint_date: "2025-07-17",
    last_mint_date: "2025-07-29",
  },
  {
    user_address: "FEZhZZCPu7xTBwupZhCFHzjmhaJ8mVVtdrrLc7n1DquJ",
    total_mints: 7,
    first_mint_date: "2025-06-20",
    last_mint_date: "2025-07-29",
  },
  {
    user_address: "23d1irPf9ncmnFDEGZjdvGxK3eaLynqawCsTbZAusbQh",
    total_mints: 7,
    first_mint_date: "2025-07-06",
    last_mint_date: "2025-08-10",
  },
]

const mintTrendData = [
  { month: "May", mints: 45, users: 12 },
  { month: "Jun", mints: 78, users: 23 },
  { month: "Jul", mints: 124, users: 34 },
  { month: "Aug", mints: 156, users: 41 },
]

const distributionData = [
  { name: "1-2 Mints", value: 45, color: "hsl(var(--chart-1))" },
  { name: "3-5 Mints", value: 32, color: "hsl(var(--chart-2))" },
  { name: "6-10 Mints", value: 18, color: "hsl(var(--chart-3))" },
  { name: "10+ Mints", value: 5, color: "hsl(var(--chart-4))" },
]

export default function Dashboard() {
  const [apiData, setApiData] = useState<ApiData>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchApiData = async (endpoint: string) => {
    console.log("[v0] Starting API fetch for endpoint:", endpoint)
    setLoading(true)
    setApiError(null)

    try {
      const apiUrl = `/api/blueshift${endpoint}`
      console.log("[v0] Fetching from proxy URL:", apiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API data received:", data)

      setApiData((prev) => ({
        ...prev,
        [endpoint.replace("/", "") || "stats"]: data,
      }))
      setApiError(null)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("[v0] API Error details:", error)

      let errorMessage = "Unknown error occurred"

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out after 15 seconds"
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error - check your connection"
        } else {
          errorMessage = error.message
        }
      }

      setApiError(errorMessage)

      if (endpoint === "/users") {
        console.log("[v0] Using fallback sample data for users endpoint")
        setApiData((prev) => ({ ...prev, users: userData }))
      } else if (endpoint === "/stats") {
        console.log("[v0] Using fallback sample data for stats endpoint")
        setApiData((prev) => ({
          ...prev,
          stats: {
            total: totalMints,
            collections: [
              { address: "53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz", name: "Anchor Vault", supply: 144 },
              { address: "AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK", name: "Pinocchio Vault", supply: 88 },
              { address: "2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L", name: "Anchor Escrow", supply: 64 },
              { address: "HTXVJ8DD6eSxkVyDwgddxGw8cC8j6kXda3BUipA43Wvs", name: "Pinocchio Escrow", supply: 38 },
            ],
          },
        }))
      } else if (endpoint === "/collections") {
        console.log("[v0] Using fallback sample data for collections endpoint")
        setApiData((prev) => ({
          ...prev,
          collections: [
            { address: "53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz", name: "Anchor Vault", supply: 144 },
            { address: "AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK", name: "Pinocchio Vault", supply: 88 },
            { address: "2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L", name: "Anchor Escrow", supply: 64 },
            { address: "HTXVJ8DD6eSxkVyDwgddxGw8cC8j6kXda3BUipA43Wvs", name: "Pinocchio Escrow", supply: 38 },
          ],
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiData("/stats")
    fetchApiData("/collections")
    fetchApiData("/users")
  }, [])

  const currentUsers = apiData.users || userData
  const currentCollections = apiData.collections || apiData.stats?.collections || []
  const totalMints = apiData.stats?.total || currentUsers.reduce((sum, user) => sum + user.total_mints, 0)
  const totalUsers = currentUsers.length
  const avgMintsPerUser = totalUsers > 0 ? (totalMints / totalUsers).toFixed(1) : "0"
  const totalCollections = currentCollections.length

  // Safe chart data transformations with proper null checks
  const safeCollectionsData = currentCollections.length > 0 ? currentCollections.slice(0, 6) : []
  const safeDistributionData = distributionData.map((item) => ({
    ...item,
    label: item.name, // Ensure label property exists
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-foreground">Blueshift Analytics</h1>
                <p className="text-sm text-muted-foreground">Certification Indexer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchApiData("/stats")
                  fetchApiData("/collections")
                  fetchApiData("/users")
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh All"}
              </Button>
              <Badge
                variant={apiError ? "destructive" : "secondary"}
                className={apiError ? "" : "bg-accent/10 text-accent-foreground"}
              >
                {apiError ? "API Error" : "Live"}
              </Badge>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">Updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          {apiError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>API Connection Issue:</strong> {apiError}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Using sample data for demonstration. Check console for detailed error information.
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Mints</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalMints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all collections</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Unique addresses</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collections</CardTitle>
              <Package className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCollections}</div>
              <p className="text-xs text-muted-foreground">Active collections</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Mints/User</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgMintsPerUser}</div>
              <p className="text-xs text-muted-foreground">Per user average</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Collection Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Collection Distribution</CardTitle>
                  <CardDescription>Mint supply across collections</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Conditional rendering for chart data */}
                  {safeCollectionsData.length > 0 ? (
                    <ChartContainer
                      config={{
                        supply: { label: "Supply", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={safeCollectionsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="supply" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <p>No collection data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Mint Distribution</CardTitle>
                  <CardDescription>User distribution by mint count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Users", color: "hsl(var(--chart-1))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {/* Safe mapping with proper key handling */}
                          {safeDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {safeDistributionData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Collections Overview
                </CardTitle>
                <CardDescription>All collections with their mint supply and details</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Conditional rendering for collections */}
                {currentCollections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCollections.map((collection, index) => (
                      <div
                        key={collection.address}
                        className="p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{collection.name}</h3>
                              <p className="text-xs text-muted-foreground font-mono">
                                {collection.address.slice(0, 8)}...{collection.address.slice(-4)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                            {collection.supply} mints
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((collection.supply / Math.max(...currentCollections.map((c) => c.supply))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {totalMints > 0 ? ((collection.supply / totalMints) * 100).toFixed(1) : "0"}% of total supply
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No collections data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Users Leaderboard
                </CardTitle>
                <CardDescription>Users ranked by total mint count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentUsers.slice(0, 8).map((user, index) => (
                    <div
                      key={user.user_address}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/20 text-accent-foreground">
                            {user.user_address.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground font-mono text-sm">
                            {user.user_address.slice(0, 8)}...{user.user_address.slice(-4)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Active since {new Date(user.first_mint_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {user.total_mints} mints
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(user.last_mint_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Activity Trends</CardTitle>
                <CardDescription>Detailed mint activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    mints: { label: "Total Mints", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mintTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="mints"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">API Endpoints</CardTitle>
                  <CardDescription>Available Blueshift API endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { endpoint: "/collections", desc: "List all collections with mint counts" },
                    { endpoint: "/users", desc: "List all users with mint statistics" },
                    { endpoint: "/mints", desc: "Get timeseries mint data" },
                    { endpoint: "/totals", desc: "Get cumulative total data" },
                    { endpoint: "/stats", desc: "Database statistics" },
                  ].map((api, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                    >
                      <div>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded text-primary">
                          {api.endpoint}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">{api.desc}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => fetchApiData(api.endpoint)} disabled={loading}>
                        {loading ? "..." : "Test"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">API Response</CardTitle>
                  <CardDescription>
                    {apiError ? "Sample data (API unavailable)" : "Live API data preview"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 h-[300px] overflow-auto">
                    <pre className="text-sm text-muted-foreground">
                      {Object.keys(apiData).length > 0
                        ? JSON.stringify(apiData, null, 2)
                        : 'Loading data or click "Test" on any endpoint...'}
                    </pre>
                  </div>
                  {apiError && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                      Note: Showing fallback sample data due to API connectivity issues
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 Blueshift Analytics Dashboard</p>
            <a
              href="https://metasal.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              metasal.xyz
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
