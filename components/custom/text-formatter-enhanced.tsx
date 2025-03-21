import React from 'react';

interface TextFormatterProps {
	text: string;
	mode?: 'normal' | 'preserve-all' | 'paragraphs-only' | 'compact';
	className?: string;
	paragraphClassName?: string;
	lineClassName?: string;
}

/**
 * Enhanced TextFormatter component that can format text in various ways
 * Supports multiple formatting modes and custom styling for paragraphs and lines
 */
const EnhancedTextFormatter: React.FC<TextFormatterProps> = ({
	text,
	mode = 'normal',
	className = '',
	paragraphClassName = '',
	lineClassName = '',
}) => {
	// Make sure input is a string
	if (typeof text !== 'string') {
		return <div className='text-red-500'>Invalid text input</div>;
	}

	// If the text is empty, return null
	if (!text.trim()) {
		return null;
	}

	// Normalize line endings and prepare the text
	const normalizedText = text.replace(/\r\n|\r/g, '\n');

	const renderContent = () => {
		switch (mode) {
			case 'preserve-all':
				// Preserve all whitespace exactly as it appears
				return preserveAllWhitespace(normalizedText);

			case 'paragraphs-only':
				// Only separate paragraphs, ignore single line breaks
				return preserveParagraphsOnly(normalizedText);

			case 'compact':
				// Compact mode - minimal whitespace, just basic paragraph breaks
				return compactMode(normalizedText);

			case 'normal':
			default:
				// Default mode - preserve paragraphs and line breaks
				return normalMode(normalizedText);
		}
	};

	// Default mode - preserve paragraphs and meaningful line breaks
	function normalMode(input: string) {
		// Split text into paragraphs (two or more newlines)
		const paragraphs = input.split(/\n{2,}/);

		return paragraphs.map((paragraph, index) => {
			// Handle line breaks within paragraphs
			const lines = paragraph.split(/\n/);

			return (
				<p
					key={index}
					className={`mb-4 last:mb-0 ${paragraphClassName}`}
				>
					{lines.map((line, lineIndex) => (
						<React.Fragment key={lineIndex}>
							{lineIndex > 0 && <br />}
							<span className={lineClassName}>{line}</span>
						</React.Fragment>
					))}
				</p>
			);
		});
	}

	// Preserve all whitespace mode - even blank lines
	function preserveAllWhitespace(input: string) {
		// Split by individual line breaks
		const lines = input.split(/\n/);

		// Group lines into paragraphs (empty lines create paragraph breaks)
		const result: React.ReactNode[] = [];
		let currentParagraph: string[] = [];

		lines.forEach((line, index) => {
			if (line.trim() === '') {
				if (currentParagraph.length > 0) {
					// Add the current paragraph to results
					result.push(
						<p
							key={`p-${result.length}`}
							className={`mb-4 ${paragraphClassName}`}
						>
							{currentParagraph.map(
								(paragraphLine, lineIndex) => (
									<React.Fragment key={lineIndex}>
										{lineIndex > 0 && <br />}
										<span className={lineClassName}>
											{paragraphLine}
										</span>
									</React.Fragment>
								)
							)}
						</p>
					);
					currentParagraph = [];
				}

				// Add an empty paragraph for blank lines
				result.push(
					<p
						key={`empty-${result.length}`}
						className={`mb-4 ${paragraphClassName}`}
					>
						&nbsp;
					</p>
				);
			} else {
				currentParagraph.push(line);
			}
		});

		// Add any remaining paragraph
		if (currentParagraph.length > 0) {
			result.push(
				<p
					key={`p-${result.length}`}
					className={`mb-4 last:mb-0 ${paragraphClassName}`}
				>
					{currentParagraph.map((paragraphLine, lineIndex) => (
						<React.Fragment key={lineIndex}>
							{lineIndex > 0 && <br />}
							<span className={lineClassName}>
								{paragraphLine}
							</span>
						</React.Fragment>
					))}
				</p>
			);
		}

		return result;
	}

	// Paragraphs only mode - only separate by paragraph breaks
	function preserveParagraphsOnly(input: string) {
		// Split text into paragraphs (one or more newlines)
		const paragraphs = input.split(/\n+/).filter((p) => p.trim());

		return paragraphs.map((paragraph, index) => (
			<p key={index} className={`mb-4 last:mb-0 ${paragraphClassName}`}>
				<span className={lineClassName}>
					{paragraph.replace(/\n/g, ' ')}
				</span>
			</p>
		));
	}

	// Compact mode - minimal whitespace
	function compactMode(input: string) {
		// Remove excessive whitespace and normalize
		const cleanText = input
			.replace(/\n+/g, ' ') // Replace all newlines with spaces
			.replace(/\s+/g, ' ') // Normalize spaces (multiple spaces become one)
			.trim(); // Remove leading/trailing whitespace

		// Split into sentences for better readability
		const sentences = cleanText.split(/(?<=[.!?])\s+/);

		// Group sentences into paragraphs (roughly 3-5 sentences per paragraph)
		const paragraphs: string[] = [];
		const sentencesPerParagraph = 3;

		for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
			paragraphs.push(
				sentences.slice(i, i + sentencesPerParagraph).join(' ')
			);
		}

		return paragraphs.map((paragraph, index) => (
			<p key={index} className={`mb-4 last:mb-0 ${paragraphClassName}`}>
				<span className={lineClassName}>{paragraph}</span>
			</p>
		));
	}

	return (
		<div className={`enhanced-text-formatter ${className}`}>
			{renderContent()}
		</div>
	);
};

export default EnhancedTextFormatter;
