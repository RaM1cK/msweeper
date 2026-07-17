class TokenBucket {
    private static map: Map<string, { tokens: number, lastSeen: number}> = new Map();
    private static maxRequests: number;
    private static refillRate: number;

    public static init(maxRequests: number, intervalSeconds: number) {
        this.maxRequests = maxRequests;
        this.refillRate = maxRequests / (intervalSeconds * 1000);

        setInterval(() => {
            const now = Date.now()
            this.map.forEach((value, key) => {
                if (now - value.lastSeen > intervalSeconds * 1000) this.map.delete(key);
            })
        }, 60 * 1000);
    }

    public static request(ip: string){
        const now = Date.now()
        const bucket = this.map.get(ip);

        if (bucket == undefined) {
            this.map.set(ip, {tokens: this.maxRequests - 1, lastSeen: now});

            return true;
        }

        const refill = Math.min(
            this.maxRequests,
            bucket.tokens + (now - bucket.lastSeen) * this.refillRate
        )

        if (refill < 1) return false;

        this.map.set(ip, {tokens: refill - 1, lastSeen: now});

        return true;
    }
}

export default TokenBucket;