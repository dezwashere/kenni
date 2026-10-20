import ExpoModulesCore
import PDFKit
import Vision
import UIKit

public class KenniPdfModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KenniPdf")

    AsyncFunction("pageCount") { (uri: String) throws -> Int in
      try self.openDocument(uri).pageCount
    }

    AsyncFunction("readPage") { (uri: String, pageIndex: Int) throws -> [String: Any] in
      let document = try self.openDocument(uri)
      guard pageIndex >= 0, pageIndex < document.pageCount,
            let page = document.page(at: pageIndex) else {
        throw PdfReaderError.invalidPage
      }
      let extracted = (page.string ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
      if !extracted.isEmpty {
        return ["text": extracted, "method": "embedded", "pageIndex": pageIndex]
      }

      // Only image-only pages use Vision OCR. Processing stays on the iPhone.
      let image = page.thumbnail(of: CGSize(width: 1800, height: 2400), for: .mediaBox)
      guard let cgImage = image.cgImage else { throw PdfReaderError.renderFailed }
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      try VNImageRequestHandler(cgImage: cgImage).perform([request])
      let observations = request.results ?? []
      // Vision coordinates start at the bottom left. Sort top-to-bottom,
      // then left-to-right, rather than trusting detector return order.
      let sorted = observations.sorted { a, b in
        let ay = a.boundingBox.midY
        let by = b.boundingBox.midY
        if abs(ay - by) > 0.015 { return ay > by }
        return a.boundingBox.minX < b.boundingBox.minX
      }
      let text = sorted.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
      return ["text": text, "method": "ocr", "pageIndex": pageIndex]
    }
  }

  private func openDocument(_ uri: String) throws -> PDFDocument {
    guard let url = URL(string: uri), url.isFileURL,
          let document = PDFDocument(url: url) else { throw PdfReaderError.invalidFile }
    // PDFKit does not expose `isUnlocked` on all iOS SDK versions. An empty
    // password check preserves support for unprotected PDFs while rejecting
    // documents that still require a password.
    if document.isEncrypted && !document.unlock(withPassword: "") {
      throw PdfReaderError.lockedFile
    }
    return document
  }
}

private enum PdfReaderError: String, Error {
  case invalidFile = "Unable to open PDF file"
  case lockedFile = "PDF is password protected"
  case invalidPage = "Page is outside PDF bounds"
  case renderFailed = "Unable to render PDF page for OCR"
}
