Pod::Spec.new do |s|
  s.name           = 'KenniPdf'
  s.version        = '1.0.0'
  s.summary        = 'Native PDFKit and Vision OCR for kenni'
  s.description    = 'Offline PDF text extraction and OCR for iOS.'
  s.license        = { :type => 'MIT' }
  s.author         = 'kenni'
  s.homepage       = 'https://github.com/dezwashere/kenni'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { :git => 'https://github.com/dezwashere/kenni.git', :tag => s.version.to_s }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'PDFKit', 'Vision', 'UIKit'
  s.source_files = '**/*.swift'
end
