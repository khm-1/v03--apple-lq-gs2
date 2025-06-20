import type { Express } from "express";
import { createServer, type Server } from "http";
import { Container } from "@shared/infrastructure/di/Container";
import { GetPortfolioUseCase } from "@shared/application/use-cases/GetPortfolioUseCase";
import { GetMarketDataUseCase } from "@shared/application/use-cases/GetMarketDataUseCase";
import { GetTransactionsUseCase } from "@shared/application/use-cases/GetTransactionsUseCase";
import { GetDashboardDataUseCase } from "@shared/application/use-cases/GetDashboardDataUseCase";
import { ManageWatchlistUseCase } from "@shared/application/use-cases/ManageWatchlistUseCase";

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const container = Container.getInstance();

  // Get use cases from container
  const getPortfolioUseCase = container.get<GetPortfolioUseCase>('GetPortfolioUseCase');
  const getMarketDataUseCase = container.get<GetMarketDataUseCase>('GetMarketDataUseCase');
  const getTransactionsUseCase = container.get<GetTransactionsUseCase>('GetTransactionsUseCase');
  const getDashboardDataUseCase = container.get<GetDashboardDataUseCase>('GetDashboardDataUseCase');

  // Get portfolio data
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const portfolio = await getPortfolioUseCase.execute(userId);

      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      res.json(portfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Get all stocks
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await getMarketDataUseCase.execute();
      res.json(stocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  // Get stock by symbol
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await getMarketDataUseCase.getBySymbol(symbol);

      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.json(stock);
    } catch (error) {
      console.error('Error fetching stock:', error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Get user transactions
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const transactions = await getTransactionsUseCase.execute(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get complete dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const dashboardData = await getDashboardDataUseCase.execute(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  // ---

  // Get user watchlist
  app.get("/api/watchlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const watchlist = await manageWatchlistUseCase.getUserWatchlist(userId);

      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  // Add to watchlist
  app.post("/api/watchlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const createDto = req.body;

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const newItem = await manageWatchlistUseCase.addToWatchlist(userId, createDto);

      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json({ message: getErrorMessage(error) || "Failed to add to watchlist" });
    }
  });

  // Update watchlist item
  app.patch("/api/watchlist/:userId/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = parseInt(req.params.itemId);
      const updateDto = req.body;

      if (isNaN(userId) || userId <= 0 || isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({ message: "Invalid user ID or item ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      const updatedItem = await manageWatchlistUseCase.updateWatchlistItem(userId, itemId, updateDto);

      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      res.status(500).json({ message: getErrorMessage(error) || "Failed to update watchlist item" });
    }
  });

  // Remove from watchlist
  app.delete("/api/watchlist/:userId/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = parseInt(req.params.itemId);

      if (isNaN(userId) || userId <= 0 || isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({ message: "Invalid user ID or item ID" });
      }

      const manageWatchlistUseCase = container.get<ManageWatchlistUseCase>('ManageWatchlistUseCase');
      await manageWatchlistUseCase.removeFromWatchlist(userId, itemId);

      res.status(204).send();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json({ message: getErrorMessage(error) || "Failed to remove from watchlist" });
    }
  });
  // ---

  const httpServer = createServer(app);
  return httpServer;
}
