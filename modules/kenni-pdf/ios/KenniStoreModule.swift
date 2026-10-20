import ExpoModulesCore
import StoreKit

@available(iOS 15.0, *)
public class KenniStoreModule: Module {
  private let productIds = ["kenni.pdf_read_aloud.monthly", "kenni.pdf_read_aloud.annual"]

  public func definition() -> ModuleDefinition {
    Name("KenniStore")

    AsyncFunction("status") { () async -> [String: Any] in
      await self.entitlementStatus()
    }

    AsyncFunction("offers") { () async throws -> [[String: String]] in
      try await Product.products(for: self.productIds).map { ["id": $0.id, "price": $0.displayPrice, "name": $0.displayName] }
    }

    AsyncFunction("purchase") { (requestedId: String) async throws -> [String: Any] in
      let products = try await Product.products(for: self.productIds)
      guard let product = products.first(where: { $0.id == requestedId }) else { throw StoreError.productUnavailable }
      let result = try await product.purchase()
      switch result {
      case .success(let verification):
        guard case .verified(let transaction) = verification else { throw StoreError.unverified }
        await transaction.finish()
        return await self.entitlementStatus()
      case .userCancelled, .pending:
        return await self.entitlementStatus()
      @unknown default:
        return await self.entitlementStatus()
      }
    }

    AsyncFunction("restore") { () async throws -> [String: Any] in
      try await AppStore.sync()
      return await self.entitlementStatus()
    }
  }

  private func entitlementStatus() async -> [String: Any] {
    let now = Date()
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result,
            self.productIds.contains(transaction.productID),
            transaction.revocationDate == nil,
            (transaction.expirationDate == nil || transaction.expirationDate! > now) else { continue }
      return ["pdfReadAloud": true]
    }
    return ["pdfReadAloud": false]
  }
}

private enum StoreError: String, Error {
  case productUnavailable = "Subscription is not configured in App Store Connect"
  case unverified = "Apple could not verify this purchase"
}
