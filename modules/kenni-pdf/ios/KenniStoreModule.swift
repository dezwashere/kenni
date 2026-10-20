import ExpoModulesCore
import StoreKit

@available(iOS 15.0, *)
public class KenniStoreModule: Module {
  private let productId = "kenni.pdf_read_aloud.monthly"

  public func definition() -> ModuleDefinition {
    Name("KenniStore")

    AsyncFunction("status") { () async -> [String: Any] in
      await self.entitlementStatus()
    }

    AsyncFunction("offer") { () async throws -> [String: String] in
      let products = try await Product.products(for: [self.productId])
      guard let product = products.first else { throw StoreError.productUnavailable }
      return ["id": product.id, "price": product.displayPrice, "name": product.displayName]
    }

    AsyncFunction("purchase") { () async throws -> [String: Any] in
      let products = try await Product.products(for: [self.productId])
      guard let product = products.first else { throw StoreError.productUnavailable }
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
            transaction.productID == productId,
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
